#!/usr/bin/env python3

# pip3 install pyyaml
# brew install graphviz

import os
import yaml
import subprocess

workflow_dir = "workflows"
dependencies = {}
for file in os.listdir(workflow_dir):
    if not file.endswith(".yml") or file.endswith(".yaml"):
        continue
    with open(os.path.join(workflow_dir, file), "r") as f:
        data = yaml.safe_load(f)
        for job_name, job_data in data.get("jobs", {}).items():
            uses = job_data.get("uses")
            if uses:
                uses = uses.removeprefix("./.github/workflows/")
                uses = uses.removeprefix("./.github/")
                dependencies[file] = dependencies.get(file, []) + [uses]
            for step in job_data.get("steps", []):
                uses = step.get("uses")
                if uses and uses.startswith("."):
                    uses = uses.removeprefix("./.github/workflows/")
                    uses = uses.removeprefix("./.github/")
                    dependencies[file] = dependencies.get(file, []) + [uses]


g = "digraph {\n"
for src, dsts in dependencies.items():
    for dst in dsts:
        g += src.replace(".yml", "").replace("/", "_")
        g += " -> "
        g += dst.replace(".yml", "").replace("/", "_")
        g += "\n"
g += "}"

out = subprocess.run(["dot", "-Tpdf"], input=g.encode("utf-8"), capture_output=True)
out_file = "github_actions_graph.pdf"
with open(out_file, "wb") as f:
    f.write(out.stdout)
subprocess.run(["open", out_file])
