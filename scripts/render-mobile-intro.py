"""Render the mobile camera turn with the poster's framing, materials and lighting.

blender --background --python scripts/render-mobile-intro.py
Requires ffmpeg. The frames are temporary; the small H.264 clip ships with the site.
"""
import bpy
import importlib.util
import math
from mathutils import Quaternion, Vector
from pathlib import Path
import shutil
import subprocess
import tempfile

ffmpeg = shutil.which("ffmpeg")
if not ffmpeg:
    raise RuntimeError("ffmpeg is required to encode the mobile intro")

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("mobile_poster", root / "scripts/render-mobile-camera.py")
poster = importlib.util.module_from_spec(spec)
spec.loader.exec_module(poster)
poster.prepare_mobile_model()

model = bpy.data.objects["ZV-E10"]
pivot = bpy.data.objects.new("Mobile_Intro_Pivot", None)
bpy.data.collections["ZV-E10_Real"].objects.link(pivot)
pivot.location = Vector((0, 0, .032))
bpy.context.view_layer.update()
matrix = model.matrix_world.copy()
model.parent = pivot
model.matrix_world = matrix
pivot.rotation_mode = "QUATERNION"

assets = root / "site/assets/camera"
with tempfile.TemporaryDirectory(prefix="roger-camera-intro-") as temporary:
    frames = Path(temporary)
    for frame in range(42):
        # A short anticipation, followed by an ease-out into the reading pose.
        k = max(0, (frame - 2) / 39)
        remaining = (1 - k) ** 3
        pivot.rotation_quaternion = (Quaternion((1, 0, 0), .28 * remaining)
                                     @ Quaternion((0, 0, 1), math.pi * .78 * remaining))
        bpy.context.view_layer.update()
        poster.render_poster(str(frames / f"frame-{frame:03d}.webp"),
                             width=1280, samples=16, overscan=1.5)
        print(f"INTRO_FRAME {frame + 1}/42", flush=True)
    subprocess.run([
        ffmpeg, "-y", "-loglevel", "warning", "-framerate", "24",
        "-i", str(frames / "frame-%03d.webp"), "-filter_complex",
        "color=c=0xddd8d1:s=1280x720:r=24[bg];[bg][0:v]overlay=shortest=1:format=auto,format=yuv420p[v]",
        "-map", "[v]", "-c:v", "libx264", "-crf", "21", "-preset", "medium",
        "-movflags", "+faststart", "-an", str(assets / "mobile-intro.mp4")
    ], check=True)
print("INTRO_READY", (assets / "mobile-intro.mp4").stat().st_size, flush=True)
