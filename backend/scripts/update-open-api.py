import json
from urllib.request import urlopen
  
specUrl = "https://api.onefootprint.com/docs-spec-v3"
response = urlopen(specUrl);

data = json.loads(response.read())

paths = data['paths'];
newPaths = dict()

# Filter out endpoints with private or hosted tags
internalTags = ["Private", "Hosted"];

for (pathName, pathDef) in paths.items():
	methods = pathDef.keys();

	# Some methods might be public, others might be private
	privateMethods = [];
	for method in methods:
		tags = pathDef[method]['tags'];
		isPrivate = not set(tags).isdisjoint(internalTags)
		if isPrivate:
			privateMethods.append(method);
	
	# Filter out private ones
	if len(privateMethods) > 0:
		for privateMethod in privateMethods: 
			del pathDef[privateMethod];

	# If there are any public methods remaining
	if len(pathDef.keys()) > 0:
		newPaths[pathName] = pathDef


data['paths'] = newPaths;

f = open("out/public-api.json", "w")
f.write(json.dumps(data))
f.close()
