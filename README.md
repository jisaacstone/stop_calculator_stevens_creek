Run locally: `npm run dev`
Build static site: `npm run build`

## Pulling data

creates `nld.json` and `sc-geojson.json`

create virtual environment, install dependencies, run script

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python ./scripts/osmnx_dl.py
```
