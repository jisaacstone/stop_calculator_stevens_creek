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


# Project Setup Instructions (macOS)

This guide provides step-by-step instructions to set up and run the project on macOS. 

## Prerequisites

Ensure you have the following installed:

Homebrew (for package management):

/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

Node.js & npm (for running the frontend):

brew install node

Python 3 (for running scripts):

brew install python

## 1. Running the Development Server

Navigate to the project directory and install dependencies:

cd /path/to/your/project
npm install

To start the development server in the background (install pm2 before: npm install -g pm2):
pm2 start "npm run dev" --name myapp

(Learn URL from, pm2 logs myapp)

To build a static site:

npm run build

## 2. Pulling Data

This step involves setting up a Python virtual environment, installing dependencies, and running a script to fetch data.

Create and activate a virtual environment:

python3 -m venv .venv
source .venv/bin/activate

Install dependencies:

pip install --upgrade pip
pip install -r requirements.txt

Run the data-fetching script:

python ./scripts/osmnx_dl.py

## 3. Troubleshooting

If npm run dev fails, ensure dependencies are installed using npm install.

If source .venv/bin/activate does not work in zsh, use:

source .venv/bin/activate.zsh

If pip install -r requirements.txt fails due to missing dependencies, try upgrading pip:

pip install --upgrade pip

If Python dependencies fail, ensure python3 is installed via Homebrew:

brew install python

## 4. Exiting the Virtual Environment

When finished, deactivate the virtual environment:

deactivate

## 5. Cleaning Up

To remove the virtual environment and temporary files:

rm -rf .venv

To clean up the node_modules folder:

rm -rf node_modules

To reinstall all Node.js dependencies:

npm install

## 6. Running Everything Together

If you want to set up everything in one go, run:

npm install && npm run dev &
python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && python ./scripts/osmnx_dl.py

Everything should now be set up and running correctly. 🚀
