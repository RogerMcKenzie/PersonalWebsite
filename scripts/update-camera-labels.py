"""Update only the stationary wheel decal in the shipped camera, then its desktop poster.
Run: blender --background --python scripts/update-camera-labels.py

Atlas helpers below come from the original zv_e10_real_build.py. The original model's
geometry, materials, AO, UVs and all other nodes remain byte-for-byte in the GLB.
The patch appends the replacement decal data, then switches the existing label mesh.
"""
import bpy, bmesh, math, os, json, struct, tempfile, runpy, subprocess
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree

ATLAS_W = 1024
TEX_DIR = "textures"
PENDING_LABELS = []
WORK = tempfile.TemporaryDirectory(prefix="portfolio-wheel-")
def project_dir():
    return WORK.name

def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return (*lin, 1.0)

def link(obj, coll, parent, loc, rot):
    coll.objects.link(obj)
    if parent is not None:
        obj.parent = parent
    obj.location = loc
    obj.rotation_euler = [math.radians(a) for a in rot]
    return obj

def load_font(path=None):
    if path is None:
        path = os.path.normpath(os.path.join(os.path.dirname(bpy.app.binary_path), "..", "Resources",
                                             "%d.%d" % bpy.app.version[:2], "datafiles", "fonts", "Inter.woff2"))
    try:
        return bpy.data.fonts.load(path, check_existing=True)
    except Exception as e:
        print("font not loaded, using default:", e)
        return None

class LabelSpec:
    """A printed marking waiting to be turned into a textured decal by finish_labels()."""
    def __init__(self, name, parts, parent, loc, rot):
        self.name, self.parts, self.parent, self.loc, self.rot = name, parts, parent, loc, rot
        self.space_character = 1.0          # letter spacing, as on a Blender text curve
        self.scale = (1, 1, 1)              # only x is used: widens the glyphs
        self.data = self

def label_mesh(name, items, mat, coll, parent, loc, rot, font=None):
    """Several markings that the site hides as one unit ("Label_<name>").
    items: ("text", body, size, (x, y)) or ("poly", [(x, y), ...]); x right and y up as read."""
    # one atlas cell and one quad per marking, so spread-out legends don't waste texture space
    spec = LabelSpec(name, [([it], None, font) for it in items], parent, loc, rot)
    PENDING_LABELS.append(spec)
    return spec

def font_mesh(body, size, font, coll, spacing=1.0):
    """Flat mesh of a line of text, centred on its origin (temporary datablock; caller frees it)."""
    cu = bpy.data.curves.new("tmp_text", "FONT")
    cu.body = body; cu.size = size; cu.align_x = "CENTER"; cu.align_y = "CENTER"
    cu.space_character = spacing
    if font:
        cu.font = font
    tmp = bpy.data.objects.new("tmp_text", cu)
    coll.objects.link(tmp)
    bpy.context.view_layer.update()
    me = bpy.data.meshes.new_from_object(tmp.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    bpy.data.objects.remove(tmp, do_unlink=True)
    bpy.data.curves.remove(cu)
    return me

def finish_labels(coll, M):
    """Rasterise every pending marking into one RGBA atlas (textures/zv-e10-labels.png) and
    replace it with a small decal mesh that carries UVs into that atlas. Text costs two
    triangles per flat label instead of thousands, and stays a separate object per label."""
    specs, flats = list(PENDING_LABELS), []
    PENDING_LABELS.clear()
    for spec in specs:                       # 1. flat source meshes and their bounds
        for items, bend, font in spec.parts:
            bm = bmesh.new()
            for it in items:
                if it[0] == "poly":
                    bm.faces.new([bm.verts.new((x, y, 0)) for x, y in it[1]])
                    continue
                _, body, size, (ox, oy) = it
                me = font_mesh(body, size, font, coll, spec.space_character)
                limit = getattr(spec, "text_widths", {}).get(body)
                fit = min(1.0, limit / max(1e-9, max(v.co.x for v in me.vertices) - min(v.co.x for v in me.vertices))) if limit else 1.0
                angle = math.radians(getattr(spec, "text_angles", {}).get(body, 0))
                for v in me.vertices:
                    x, y = v.co.x * spec.scale[0] * fit, v.co.y
                    v.co.x = x * math.cos(angle) - y * math.sin(angle) + ox
                    v.co.y = x * math.sin(angle) + y * math.cos(angle) + oy
                bm.from_mesh(me)
                bpy.data.meshes.remove(me)
            xs = [v.co.x for v in bm.verts]; ys = [v.co.y for v in bm.verts]
            pad = 0.012
            flats.append(dict(spec=spec, bend=bend, bm=bm,
                              box=(min(xs) - pad, min(ys) - pad, max(xs) + pad, max(ys) + pad)))
    # 2. shelf-pack the cells; lower the density until everything fits a square atlas
    density, gap = 560.0, 6
    while True:
        x = y = shelf = gap
        ok = True
        for f in sorted(flats, key=lambda f: -(f["box"][3] - f["box"][1])):
            w = math.ceil((f["box"][2] - f["box"][0]) * density); h = math.ceil((f["box"][3] - f["box"][1]) * density)
            if w + 2 * gap > ATLAS_W:
                ok = False; break
            if x + w + gap > ATLAS_W:
                x = gap; y += shelf + gap; shelf = 0
            f["cell"] = (x, y, w, h)
            x += w + gap; shelf = max(shelf, h)
        used = y + shelf + gap
        if ok and used <= ATLAS_W // 2:
            break
        density *= 0.95
    atlas_h = ATLAS_W // 2
    # 3. render the atlas in a throwaway scene (1 unit = 1 cm there)
    sc = bpy.data.scenes.new("ZVR_Atlas_Tmp")
    tmp_objs = []
    for f in flats:
        cx, cy, w, h = f["cell"]
        me = bpy.data.meshes.new("tmp_atlas")
        f["bm"].to_mesh(me)
        o = bpy.data.objects.new("tmp_atlas", me)
        o.location = (cx / density - f["box"][0], cy / density - f["box"][1], 0)
        sc.collection.objects.link(o)
        tmp_objs.append(o)
    cd = bpy.data.cameras.new("tmp_atlas_cam")
    cd.type = "ORTHO"; cd.ortho_scale = ATLAS_W / density; cd.clip_start, cd.clip_end = 0.1, 10
    cam = bpy.data.objects.new("tmp_atlas_cam", cd)
    cam.location = (ATLAS_W / density / 2, atlas_h / density / 2, 5)
    sc.collection.objects.link(cam)
    sc.camera = cam
    try:
        sc.render.engine = "BLENDER_WORKBENCH"
    except TypeError as e:
        print("workbench not available:", e)
    sh = sc.display.shading
    sh.light = "FLAT"; sh.color_type = "SINGLE"; sh.single_color = srgb("#E8E8E4")[:3]
    sc.display.render_aa = "16"
    sc.view_settings.view_transform = "Standard"
    sc.render.film_transparent = True
    sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = ATLAS_W, atlas_h, 100
    sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGBA"
    tex_dir = os.path.join(project_dir(), TEX_DIR)
    os.makedirs(tex_dir, exist_ok=True)
    path = os.path.join(tex_dir, "zv-e10-labels.png")
    sc.render.filepath = path
    bpy.ops.render.render(scene=sc.name, write_still=True)
    for o in tmp_objs:
        me = o.data
        bpy.data.objects.remove(o, do_unlink=True); bpy.data.meshes.remove(me)
    bpy.data.objects.remove(cam, do_unlink=True); bpy.data.cameras.remove(cd)
    bpy.data.scenes.remove(sc)
    old = bpy.data.images.get("zv-e10-labels.png")
    if old:
        bpy.data.images.remove(old)
    img = bpy.data.images.load(path)
    if bpy.data.filepath:
        img.filepath = bpy.path.relpath(path)
    mat = decal_material(img)
    # 4. decal meshes
    by_spec = {}
    for f in flats:
        by_spec.setdefault(id(f["spec"]), []).append(f)
        f["bm"].free()
    for spec in specs:
        bm = bmesh.new()
        uvl = bm.loops.layers.uv.new("UVMap")
        for f in by_spec[id(spec)]:
            x0, y0, x1, y1 = f["box"]; cx, cy, w, h = f["cell"]
            fn = _bend(*f["bend"]) if f["bend"] else (lambda x, y: (x, y, 0))
            nx = ny = 1
            if f["bend"]:
                mode, radius = f["bend"][0], f["bend"][1]
                span = (y1 - y0) if mode == "along" else (x1 - x0)
                n = max(2, math.ceil(span / (radius * math.radians(5))))
                nx, ny = (1, n) if mode == "along" else (n, 1)
            grid = [[(x0 + (x1 - x0) * i / nx, y0 + (y1 - y0) * j / ny) for i in range(nx + 1)] for j in range(ny + 1)]
            verts = [[bm.verts.new(fn(*p)) for p in row] for row in grid]
            for j in range(ny):
                for i in range(nx):
                    face = bm.faces.new((verts[j][i], verts[j][i + 1], verts[j + 1][i + 1], verts[j + 1][i]))
                    for loop, (gi, gj) in zip(face.loops, ((i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1))):
                        px, py = grid[gj][gi]
                        loop[uvl].uv = ((cx + (px - x0) * density) / ATLAS_W, (cy + (py - y0) * density) / atlas_h)
                    face.normal_update()
                    c = face.calc_center_median()
                    out = Vector((0, 0, 1)) if (not f["bend"] or f["bend"][0] == "face") else Vector((c.x, c.y, 0))
                    if face.normal.dot(out) < 0:
                        face.normal_flip()
        me = bpy.data.meshes.new("Label_" + spec.name)
        bm.to_mesh(me); bm.free()
        me.materials.append(mat)
        o = link(bpy.data.objects.new("Label_" + spec.name, me), coll, spec.parent, spec.loc, spec.rot)
        o["zv_label"] = True
        o["marking"] = getattr(spec, "marking", " | ".join(
            it[1] for items, bend, font in spec.parts for it in items if it[0] == "text"))
    print("label atlas: %d markings in %d cells, %dx%d at %.0f px/cm" % (len(specs), len(flats), ATLAS_W, atlas_h, density))

def _tex_nodes(mat, kinds=("TEX_IMAGE", "NORMAL_MAP", "MAPPING", "TEX_COORD")):
    nt = mat.node_tree
    for n in [n for n in nt.nodes if n.type in kinds]:
        nt.nodes.remove(n)
    return nt, next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")

def decal_material(img):
    """Alpha-blended white print. Exports as a glTF BLEND material with the atlas as base colour."""
    m = bpy.data.materials.get("ZVR_Labels") or bpy.data.materials.new("ZVR_Labels")
    m.use_nodes = True
    nt, p = _tex_nodes(m)
    tex = nt.nodes.new("ShaderNodeTexImage"); tex.image = img; tex.location = (-400, 200)
    nt.links.new(tex.outputs["Color"], p.inputs["Base Color"])
    nt.links.new(tex.outputs["Alpha"], p.inputs["Alpha"])
    p.inputs["Roughness"].default_value = 0.55
    p.inputs["Metallic"].default_value = 0.0
    m.use_backface_culling = True
    for attr, val in (("surface_render_method", "BLENDED"), ("blend_method", "BLEND")):
        try:
            setattr(m, attr, val)
        except (AttributeError, TypeError):
            pass
    return m

def read_glb(path):
    raw = Path(path).read_bytes()
    size = struct.unpack_from("<I", raw, 12)[0]
    return json.loads(raw[20:20 + size]), raw[28 + size:]

def replace_decal(path, replacement):
    asset, binary = read_glb(path)
    new, data = read_glb(replacement)
    # Blender's PNG writer leaves a large texture. Lossless recompression keeps the
    # new words within the existing 5 MB model budget without changing any pixel.
    for image in new.get("images", []):
        view = new["bufferViews"][image["bufferView"]]
        start, length = view.get("byteOffset", 0), view["byteLength"]
        assert len(data) - start - length < 4, "texture is the final buffer view"
        source = Path(WORK.name) / "atlas-source.png"
        output = Path(WORK.name) / "atlas-optimized.png"
        source.write_bytes(data[start:start + length])
        subprocess.run(["magick", str(source), "-strip", "-define",
                        "png:compression-level=9", str(output)], check=True)
        pixels = output.read_bytes()
        data = data[:start] + pixels
        view["byteLength"] = len(pixels)
        data += b"\x00" * (-len(data) % 4)
    offset = len(binary)
    counts = {key: len(asset.get(key, [])) for key in
              ("bufferViews", "accessors", "materials", "images", "textures", "samplers")}
    for v in new["bufferViews"]:
        v["byteOffset"] = v.get("byteOffset", 0) + offset
        v["buffer"] = 0
    for a in new["accessors"]:
        a["bufferView"] += counts["bufferViews"]
    for image in new.get("images", []):
        image["bufferView"] += counts["bufferViews"]
    for tex in new.get("textures", []):
        tex["source"] += counts["images"]
        if "sampler" in tex:
            tex["sampler"] += counts["samplers"]
    for mat in new["materials"]:
        for field in (mat, mat.get("pbrMetallicRoughness", {})):
            for key, value in field.items():
                if key.endswith("Texture") and isinstance(value, dict):
                    value["index"] += counts["textures"]
    label = next(n for n in new["nodes"] if n["name"] == "Label_Wheel_Arrows")
    mesh = new["meshes"][label["mesh"]]
    for primitive in mesh["primitives"]:
        primitive["indices"] += counts["accessors"]
        primitive["material"] += counts["materials"]
        primitive["attributes"] = {k: v + counts["accessors"] for k, v in primitive["attributes"].items()}
    original = next(n for n in asset["nodes"] if n["name"] == "Label_Wheel_Arrows")
    asset["meshes"][original["mesh"]] = mesh
    original["extras"]["marking"] = "CONTACT | PROJECTS | PHOTOS | RÉSUMÉ"
    next(n for n in asset["nodes"] if n["name"] == "ZV-E10")["extras"]["portfolio_label_version"] = 5
    for key in counts:
        asset.setdefault(key, []).extend(new.get(key, []))
    for ext in new.get("extensionsUsed", []):
        if ext not in asset.setdefault("extensionsUsed", []):
            asset["extensionsUsed"].append(ext)
    binary += data
    asset["buffers"][0]["byteLength"] = len(binary)
    encoded = json.dumps(asset, ensure_ascii=False, separators=(",", ":")).encode()
    encoded += b" " * (-len(encoded) % 4)
    binary += b"\x00" * (-len(binary) % 4)
    result = struct.pack("<4sII", b"glTF", 2, 28 + len(encoded) + len(binary))
    result += struct.pack("<I4s", len(encoded), b"JSON") + encoded
    result += struct.pack("<I4s", len(binary), b"BIN\x00") + binary
    Path(path).write_bytes(result)


def prune_asset(path):
    """Drop obsolete decal buffers after replacement while preserving the camera scene."""
    output = Path(WORK.name) / "camera-pruned.glb"
    subprocess.run(["npx", "--yes", "@gltf-transform/cli@4.5.1", "prune", str(path), str(output)], check=True)
    asset, binary = read_glb(output)
    for material in asset.get("materials", []):
        if material.get("name", "").startswith("ZVR_WheelLabels"):
            material["name"] = "ZVR_WheelLabels"
    encoded = json.dumps(asset, ensure_ascii=False, separators=(",", ":")).encode()
    encoded += b" " * (-len(encoded) % 4)
    binary += b"\x00" * (-len(binary) % 4)
    result = struct.pack("<4sII", b"glTF", 2, 28 + len(encoded) + len(binary))
    result += struct.pack("<I4s", len(encoded), b"JSON") + encoded
    result += struct.pack("<I4s", len(binary), b"BIN\x00") + binary
    Path(path).write_bytes(result)


def render_desktop(repo, assets):
    renderer = runpy.run_path(str(repo / "scripts/render-mobile-camera.py"))
    renderer["prepare_mobile_model"]()
    for name in ("Label_Menu", "Label_Fn", "Label_Delete_Icon", "Label_Playback_Icon", "Label_Home", "Label_Wheel_Arrows"):
        bpy.data.objects[name].hide_render = False
    renderer["render_poster"](str(assets / "zv-e10-rear.webp"))


def main():
    repo = Path(__file__).resolve().parents[1]
    assets = repo / "site/assets/camera"
    path = assets / "zv-e10.glb"
    current, _ = read_glb(path)
    label_node = next(n for n in current["nodes"] if n["name"] == "Label_Wheel_Arrows")
    if label_node.get("extras", {}).get("marking") == "CONTACT | PROJECTS | PHOTOS | RÉSUMÉ":
        render_desktop(repo, assets)
        print("Wheel already updated; refreshed desktop poster only")
        return
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(path))
    root = bpy.data.objects["ZV-E10"]
    original = bpy.data.objects["Label_Wheel_Arrows"]
    old_matrix = original.matrix_world.copy()
    bpy.data.objects.remove(original, do_unlink=True)
    # Keep every original decal/texture intact; this atlas is for the new wheel only.
    bpy.data.materials["ZVR_Labels"].name = "ZVR_OriginalLabels"
    for image in bpy.data.images:
        if image.name == "zv-e10-labels.png":
            image.name = "zv-e10-original-labels.png"
    coll = bpy.context.scene.collection
    legends = label_mesh("Wheel_Arrows", [
        ("text", "CONTACT", .22, (0, 1.16)), ("text", "PROJECTS", .22, (1.12, 0)),
        ("text", "PHOTOS", .22, (0, -1.16)), ("text", "RÉSUMÉ", .22, (-1.02, 0)),
    ], None, coll, root, (-3.85, 2.124, 2.20), (90, 0, 180), load_font())
    legends.text_angles = {"RÉSUMÉ": 90, "PROJECTS": -90}
    finish_labels(coll, {})
    label = bpy.data.objects["Label_Wheel_Arrows"]
    # Reuse the exact original label transform under the imported root.
    label.matrix_world = old_matrix
    label.active_material.name = "ZVR_WheelLabels"
    bpy.context.view_layer.update()
    # A small grid follows the body bevel, as in the original full model generator.
    bm = bmesh.new(); bm.from_mesh(label.data)
    bmesh.ops.subdivide_edges(bm, edges=list(bm.edges), cuts=7, use_grid_fill=True)
    bm.to_mesh(label.data); bm.free()
    dg = bpy.context.evaluated_depsgraph_get()
    surfaces = [(o, o.matrix_world.inverted(), BVHTree.FromObject(o, dg))
                for o in bpy.context.scene.objects if o.name in ("Static_Body", "Static_Grip_Rubber")]
    inverse = label.matrix_world.inverted()
    for vertex in label.data.vertices:
        world = label.matrix_world @ vertex.co
        origin = Vector((world.x, .08, world.z))
        hits = []
        for obj, inv, tree in surfaces:
            hit, _, _, _ = tree.ray_cast(inv @ origin,
                (inv.to_3x3() @ Vector((0, -1, 0))).normalized())
            if hit is not None:
                hits.append(obj.matrix_world @ hit)
        if hits:
            hit = max(hits, key=lambda v: v.y); hit.y += .00003
            vertex.co = inverse @ hit
    label.data.update()
    bpy.ops.object.select_all(action="DESELECT")
    label.select_set(True)
    temp_glb = Path(WORK.name) / "wheel.glb"
    bpy.ops.export_scene.gltf(filepath=str(temp_glb), export_format="GLB", use_selection=True,
        export_extras=True, export_yup=True, export_animations=False)
    replace_decal(path, temp_glb)
    prune_asset(path)
    render_desktop(repo, assets)
    print("Updated wheel printing and desktop poster", path.stat().st_size)

if __name__ == "__main__":
    main()
