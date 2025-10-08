Project description
ATLAS Open Magic 🪄📊
Tests Dynamic TOML Badge codecov

atlasopenmagic is a Python package made to simplify working with ATLAS Open Data by providing utilities to manage metadata and URLs for streaming the data.

Key Features:
Simple functions to set the active data release (e.g., 2024r-pp).
Efficient local caching of metadata to minimize API calls.
Helper functions to retrieve specific dataset information, including file URLs for different "skims" (filtered versions of datasets).
Support for multiple URL protocols (root, https, eos).
Configuration via environment variables for easy integration into different workflows.
Installation
You can install this package using pip.

pip install atlasopenmagic
Alternatively, clone the repository and install locally:

git clone https://github.com/atlas-outreach-data-tools/atlasopenmagic.git
cd atlasopenmagic
pip install .
Documentation
You can find the full documentation for ATLAS Open Magic in the ATLAS Open Data website.

Quick start
First, import the package:

import atlasopenmagic as atom
See the available releases and set to one of the options given by available_releases()

atom.available_releases()
set_release('2024r-pp')
Check in the Monte Carlo Metadata which datasets do you want to retrieve and use the 'Dataset ID'. For example, to get the metadata from Pythia8EvtGen_A14MSTW2008LO_Zprime_NoInt_ee_SSM3000:

all_metadata = atom.get_metadata('301204')
If we only want a specific variable:

xsec = atom.get_metadata('301204', 'cross_section')
To get the URLs to stream the files for that MC dataset:

all_mc = atom.get_urls('301204')
To get some data instead, check the available options:

atom.available_data()
And get the URLs for the one that's to be used:

all_mc = atom.get_urls('2016')
Contributing
Contributions are welcome! To contribute:

Fork the repository.
Create a new branch (git checkout -b feature-name).
Commit your changes (git commit -am 'Add some feature').
Push to the branch (git push origin feature-name).
Create a Pull Request.
Please ensure all tests pass before submitting a pull request (just run pytest from the main directory of the package).

Developers can also pip install including additional tools required for testing:

pip install atlasopenmagic[dev]
or with a local copy of the repository:

pip install '.[dev]'
Pre-commit Hooks
We use pre-commit hooks, find below how to use them.

Installation
Install the [dev] dependencies if you haven't already, as shown above.

Install the git hook scripts:

pre-commit install
(Optional) Run against all files:
pre-commit run --all-files
What the hooks do
black: Formats Python code consistently
isort: Sorts imports alphabetically and separates them into sections
ruff: Fast Python linter that catches common errors and style issues
codespell: Checks for common misspellings in code and comments
trailing-whitespace: Removes trailing whitespace
end-of-file-fixer: Ensures files end with a newline
pydocstyle: Checks docstring style (Google convention)
The hooks will run automatically on git commit. If any hook fails, the commit will be blocked until the issues are fixed.

License
This project is licensed under the Apache 2.0 License