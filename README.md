# SkilledVLA project page

A static site with no build step. Copy everything in this folder into the root of the
GitHub Pages repo (the paper links to `https://user84072.github.io/SIMURGH/`), push, and
set **Settings → Pages → Deploy from branch → `main` / root**. `.nojekyll` stops
GitHub from running Jekyll on the folder.

To preview locally:

```sh
python3 github_pages/serve.py   # then open http://localhost:8000
```

Use `serve.py`, not `python3 -m http.server`. The built-in server ignores HTTP Range
requests, so videos can't be scrubbed. GitHub Pages supports Range, so this only
affects local previews.

Any image or video slot whose file is missing shows a striped placeholder with the
expected path, so the page looks fine before every file is in.

## Media slots

| Slot | Path | Suggested source |
|---|---|---|
| Main video | `static/videos/teaser.mp4` | the submission video |
| Fig. 1 overview | `static/images/overview.png` | `figures/Overview.png` (not on disk yet) |
| Fig. 2 system | `static/images/system_overview.png` | `figures/system_overview.png` (not on disk yet) |
| Fig. 4 filmstrip | `static/images/pong_filmstrip.png` | `figures/pong_filmstrip.png` (not on disk yet) |
| Task grid | `static/images/eval_tasks_grid.png` | already copied |
| Sim bar chart | `static/images/success_bars.png` | already copied |
| Paper PDF | `static/pdf/paper.pdf` | compiled `paper.tex` |
| Sim: threading | `static/videos/sim/threading.mp4` | `blender_videos/threading.mp4` |
| Sim: assembly | `static/videos/sim/assembly.mp4` | `blender_videos/assembly.mp4` |
| Sim: transport | `static/videos/sim/transport.mp4` | `blender_videos/transport.mp4` |
| Sim: coffee | `static/videos/sim/coffee.mp4` | `blender_videos/coffee.mp4` |
| Sim: pouring | `static/videos/sim/pouring.mp4` | `blender_videos/pouring.mp4` |
| Sim: can sort | `static/videos/sim/can_sort.mp4` | `blender_videos/can_sort.mp4` |
| Real: SkilledVLA pong | `static/videos/real/skilled_pong.mp4` | `video_submission/A skilled_pong__2026-08-19_run_122441_001.mp4` |
| Real: vanilla pong | `static/videos/real/vanilla_pong.mp4` | `video_submission/A vanilla_pong__2026-08-14_run_220325_008.mp4` |
| Real: π0.5 pong | `static/videos/real/pi05_pong.mp4` | `video_submission/A pi05_pong__2026-09-15_run_011726_016.mp4` |
| Real: VLM-orch pong | `static/videos/real/vlmorch_pong.mp4` | `video_submission/A vlmorch_pong__2026-09-10_run_012448_014.mp4` |
| Real: SkilledVLA toast | `static/videos/real/skilled_toast.mp4` | `video_submission/A skilled_toast__2026-08-19_run_150805_016.mp4` |
| Real: vanilla toast | `static/videos/real/vanilla_toast.mp4` | `video_submission/A vanilla_toast__2026-08-19_run_144201_001.mp4` |
| Real: π0.5 toast | `static/videos/real/pi05_toast.mp4` | `video_submission/A pi05_toast_run_204145_003_head.mp4` |
| Real: VLM-orch toast | `static/videos/real/vlmorch_toast.mp4` | `video_submission/A vlmorch_toast__2026-09-11_run_223833_009.mp4` |

The sim clips play at real time. To label a clip, add e.g. `data-speed="2x"` to its
`.video-slot` in `index.html` and a badge appears in the corner.

## New videos: run faststart

Every MP4 on the site has its index (`moov`) moved to the front, so browsers can
start playback and scrub before the whole file arrives. Do the same for any new clip
(no re-encode, media bytes untouched):

```sh
python3 tools/faststart.py in.mp4 out.mp4
```

## Keep videos small

GitHub rejects files over 100 MB and Pages sites should stay under about 1 GB. Re-encode
for the web before committing (this also drops audio and makes the clips start fast):

```sh
ffmpeg -i in.mp4 -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 28 -preset slow \
       -pix_fmt yuv420p -movflags +faststart -an out.mp4
```

## Things to change at camera-ready time

- Authors: the real author/affiliation block is kept outside this folder (so it can't
  leak during review). Swap it in for "Anonymous Authors" and update the BibTeX entry.
- The arXiv button is greyed out (`class="btn disabled"`). Add the URL and drop
  `disabled`.
