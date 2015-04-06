import json

j = {} #object of fips to county name mapping

with open("national_county.txt", "r") as f:
	for l in f.readlines():
		f
