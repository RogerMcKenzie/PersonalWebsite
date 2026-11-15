"""Render the mobile rear camera from the shipped GLB without control lettering.

Run from the repository root:
  blender --background --python scripts/render-mobile-camera.py

The HTML adds upright mobile labels; desktop assets are not modified.
Uses the original camera poster framing and studio lighting.
"""
import bpy
import math
import os
from mathutils import Vector
from pathlib import Path

FRAME = dict(cx=0.0, cz=3.35, width=13.6, aspect=16 / 9)
FRAME["height"] = FRAME["width"] / FRAME["aspect"]
WEB_HIDDEN = ["Label_Menu", "Label_Fn", "Label_C2", "Label_Delete_Icon",
              "Label_Playback_Icon", "Label_Wheel_Arrows"]

def render_poster(path, width=2400, coll="ZV-E10_Real"):
    """Rear poster with the site's close warm key, cool edge strip and dark studio lighting.
    Cycles supplies contact shadows; the glTF occlusion input is for the browser only.
    Everything temporary, including colour management, is restored after rendering."""
    sc = bpy.context.scene
    r = sc.render
    saved = dict(cam=sc.camera, x=r.resolution_x, y=r.resolution_y, pct=r.resolution_percentage,
                 transp=r.film_transparent, fmt=r.image_settings.file_format, world=sc.world,
                 mode=r.image_settings.color_mode, path=r.filepath, engine=r.engine,
                 quality=r.image_settings.quality, view=sc.view_settings.view_transform,
                 look=sc.view_settings.look, exposure=sc.view_settings.exposure,
                 samples=sc.cycles.samples, denoise=sc.cycles.use_denoising)
    members = set(bpy.data.collections[coll].all_objects)
    others = [o for o in sc.objects if o not in members and not o.hide_render]
    temp = []
    cam_data = bpy.data.cameras.new("Web_Rear_Cam")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = FRAME["width"] / 100
    cam = bpy.data.objects.new("Web_Rear_Cam", cam_data)
    sc.collection.objects.link(cam)
    cam.location = (FRAME["cx"] / 100, 0.5, FRAME["cz"] / 100)
    cam.rotation_euler = (math.radians(90), 0, math.radians(180))
    temp.append((cam, cam_data))
    world = bpy.data.worlds.new("Poster_World")
    world.use_nodes = True
    bg = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs[0].default_value = (0.16, 0.16, 0.16, 1); bg.inputs[1].default_value = 0.35
    target = Vector((0, 0, 0.032))
    # glTF coordinates (x, y, z) correspond to Blender (x, -z, y).
    for name, loc, energy, size, color in (
            ("Poster_Key_Softbox", (0.45, 0.45, 0.25), 2.0, 0.30, (1.0, 0.88, 0.75)),
            ("Poster_Right_Strip", (-0.60, 0.15, 0.10), 1.4, 0.10, (0.82, 0.88, 1.0)),
            ("Poster_Overhead", (0.0, 0.10, 0.50), 5.0, 0.50, (1.0, 1.0, 1.0)),
            ("Poster_Lens_Rim", (0.0, -0.60, 0.25), 0.8, 0.40, (1.0, 1.0, 1.0))):
        ld = bpy.data.lights.new(name, "AREA"); ld.energy = energy; ld.size = size
        ld.color = color
        if name == "Poster_Right_Strip":
            ld.shape = "RECTANGLE"; ld.size_y = 0.50
        o = bpy.data.objects.new(name, ld); sc.collection.objects.link(o)
        o.location = loc
        o.rotation_euler = (target - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        temp.append((o, ld))
    ld = bpy.data.lights.new("Poster_Close_Key", "POINT")
    ld.energy = 4 * math.pi * 0.03; ld.shadow_soft_size = 0.025
    ld.color = (1.0, 0.94, 0.87)
    o = bpy.data.objects.new("Poster_Close_Key", ld); sc.collection.objects.link(o)
    o.location = (0.09, 0.15, 0.13); temp.append((o, ld))
    hidden = []
    root = next((o for o in members if o.name == "ZV-E10"), None)
    hidden_labels = ["Label_C2"] if root and root.get("portfolio_labels") else WEB_HIDDEN
    for n in hidden_labels:
        o = bpy.data.objects.get(n)
        if o and not o.hide_render:
            o.hide_render = True; hidden.append(o)
    try:
        for o in others:
            o.hide_render = True
        r.engine = "CYCLES"
        sc.cycles.samples = 64; sc.cycles.use_denoising = True
        for transform in ("Khronos PBR Neutral", "Standard"):
            try:
                sc.view_settings.view_transform = transform; break
            except TypeError:
                continue
        sc.view_settings.look = "None"; sc.view_settings.exposure = 0
        sc.camera = cam
        sc.world = world
        r.resolution_x, r.resolution_y, r.resolution_percentage = width, round(width / FRAME["aspect"]), 100
        r.film_transparent = True
        fmts = [i.identifier for i in bpy.types.ImageFormatSettings.bl_rna.properties["file_format"].enum_items]
        r.image_settings.file_format = "WEBP" if "WEBP" in fmts else "PNG"
        r.image_settings.color_mode = "RGBA"
        if r.image_settings.file_format == "WEBP":
            r.image_settings.quality = 88
            path = os.path.splitext(path)[0] + ".webp"
        r.filepath = path
        bpy.ops.render.render(write_still=True)
    finally:
        for o in hidden + others:
            o.hide_render = False
        sc.camera = saved["cam"]; sc.world = saved["world"]
        r.resolution_x, r.resolution_y, r.resolution_percentage = saved["x"], saved["y"], saved["pct"]
        r.film_transparent = saved["transp"]
        r.image_settings.file_format = saved["fmt"]
        r.image_settings.color_mode = saved["mode"]
        r.image_settings.quality = saved["quality"]
        sc.view_settings.view_transform = saved["view"]
        sc.view_settings.look = saved["look"]; sc.view_settings.exposure = saved["exposure"]
        sc.cycles.samples = saved["samples"]; sc.cycles.use_denoising = saved["denoise"]
        r.filepath = saved["path"]
        try:
            r.engine = saved["engine"]
        except TypeError:
            pass
        for o, d in temp:
            bpy.data.objects.remove(o, do_unlink=True)
            (bpy.data.lights if isinstance(d, bpy.types.Light) else bpy.data.cameras).remove(d)
        bpy.data.worlds.remove(world)
    print("poster:", path, os.path.getsize(path))
    return path


def render_mobile():
    root = Path(__file__).resolve().parents[1]
    assets = root / "site/assets/camera"
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(assets / "zv-e10.glb"))
    collection = bpy.data.collections.new("ZV-E10_Real")
    bpy.context.scene.collection.children.link(collection)
    for obj in tuple(bpy.context.scene.objects):
        collection.objects.link(obj)
    labels = ["Label_Menu", "Label_Fn", "Label_Delete_Icon", "Label_Playback_Icon",
              "Label_Home", "Label_Wheel_Arrows", "Label_C2"]
    for name in labels:
        obj = bpy.data.objects.get(name)
        if obj:
            obj.hide_render = True
    render_poster(str(assets / "zv-e10-rear-mobile.webp"), width=2400)


if __name__ == "__main__":
    render_mobile()
