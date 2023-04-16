#!/bin/bash

pip install -r requirements.txt
python ./recalpp/server/manage.py collectstatic --noinput 
