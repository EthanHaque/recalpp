#!/bin/bash

pip install -r requirements.txt
cd ./recalpp/server
python ./manage.py collectstatic --noinput 
