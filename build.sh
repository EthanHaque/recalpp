#!/bin/bash

export PYTHON_VERSION=3.10.9
pip install -r requirements.txt
python ./recalpp/server/manage.py collectstatic --noinput 
