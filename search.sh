#!/bin/bash -e

USER=$(whoami)
PAX8="/Users/${USER}/Development/pax8"
# create temp txt file to get results
mkdir temps

# V1 controllers
find $PAX8 -regex '.*ControllerImpl.[groyjva]*' > ./temps/V1.txt

#  V2 controllers
find $PAX8 -regex '.*Api.*Controller.[groyjva]*' > ./temps/V2.txt

# V3 controllers
find $PAX8 -regex '.*ControllerV3.[groyjva]*' > ./temps/V3.txt

node ./script.js

rm -rf temps