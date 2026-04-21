import os
import json

courses_data = [
  {"id": "dsa", "topics": ["dsa-intro", "dsa-arrays", "dsa-ll", "dsa-stacks", "dsa-trees", "dsa-graphs", "dsa-sorting"]},
  {"id": "web-dev", "topics": ["web-html", "web-css", "web-js", "web-react", "web-node", "web-responsive"]},
  {"id": "python", "topics": ["py-intro", "py-data", "py-funcs", "py-oop", "py-pandas"]},
  {"id": "dbms", "topics": ["db-intro", "db-relational", "db-sql", "db-normalized", "db-nosql"]},
  {"id": "oop", "topics": ["oop-concepts", "oop-java", "oop-cpp", "oop-design"]},
  {"id": "ai-ml", "topics": ["ai-intro", "ml-types", "ml-python", "dl-intro"]},
  {"id": "data-science", "topics": ["ds-intro", "ds-stats", "ds-viz", "ds-sql"]},
  {"id": "cybersecurity", "topics": ["cyber-intro", "cyber-net", "cyber-hacking", "cyber-def"]},
  {"id": "os-networks", "topics": ["os-intro", "net-intro", "os-process", "net-osi"]},
  {"id": "mobile-dev", "topics": ["mob-intro", "mob-flutter", "mob-react", "mob-native"]}
]

base_dir = r"d:\Projects\TutorAI\TutorAi\uploads\courses"

if not os.path.exists(base_dir):
    os.makedirs(base_dir)

for course in courses_data:
    for topic in course["topics"]:
        p = os.path.join(base_dir, course["id"], topic)
        if not os.path.exists(p):
            os.makedirs(p)

print("Folders created successfully.")
