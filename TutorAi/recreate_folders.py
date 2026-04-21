import os
import shutil

# mapping of course and topics
course_data = [
  {
    "id": "dsa",
    "title": "Data Structures & Algorithms",
    "topics": [
      { "id": "dsa-intro", "title": "Introduction to DSA" },
      { "id": "dsa-arrays", "title": "Arrays & Strings" },
      { "id": "dsa-ll", "title": "Linked Lists" },
      { "id": "dsa-stacks", "title": "Stacks & Queues" },
      { "id": "dsa-trees", "title": "Binary Trees" },
      { "id": "dsa-graphs", "title": "Graph Algorithms" },
      { "id": "dsa-sorting", "title": "Sorting & Searching" }
    ]
  },
  {
    "id": "web-dev",
    "title": "Web Development",
    "topics": [
      { "id": "web-html", "title": "HTML5 & Semantic Web" },
      { "id": "web-css", "title": "CSS3 & Flexbox Grid" }, # Replaced / with space so it's a valid folder name, actually the frontend had "CSS3 & Flexbox/Grid", let's replace / with -
      { "id": "web-js", "title": "JavaScript Fundamentals" },
      { "id": "web-react", "title": "React.js Basics" },
      { "id": "web-node", "title": "Node.js & Express" },
      { "id": "web-responsive", "title": "Responsive Design" }
    ]
  },
  {
    "id": "python",
    "title": "Python Programming",
    "topics": [
      { "id": "py-intro", "title": "Python Introduction" },
      { "id": "py-data", "title": "Data Types & Variables" },
      { "id": "py-funcs", "title": "Functions & Modules" },
      { "id": "py-oop", "title": "OOP in Python" },
      { "id": "py-pandas", "title": "Data Analysis with Pandas" }
    ]
  },
  {
    "id": "dbms",
    "title": "Database Management Systems",
    "topics": [
      { "id": "db-intro", "title": "Introduction to DBMS" },
      { "id": "db-relational", "title": "Relational Model & Keys" },
      { "id": "db-sql", "title": "SQL Queries" },
      { "id": "db-normalized", "title": "Normalization" },
      { "id": "db-nosql", "title": "Introduction to NoSQL" }
    ]
  },
  {
    "id": "oop",
    "title": "Object-Oriented Programming",
    "topics": [
      { "id": "oop-concepts", "title": "Core OOP Concepts" },
      { "id": "oop-java", "title": "OOP with Java" },
      { "id": "oop-cpp", "title": "OOP with C++" },
      { "id": "oop-design", "title": "Design Patterns" }
    ]
  },
  {
    "id": "ai-ml",
    "title": "AI & Machine Learning",
    "topics": [
      { "id": "ai-intro", "title": "Artificial Intelligence Basics" },
      { "id": "ml-types", "title": "Supervised vs Unsupervised" },
      { "id": "ml-python", "title": "ML with Scikit-Learn" },
      { "id": "dl-intro", "title": "Neural Networks & Deep Learning" }
    ]
  },
  {
    "id": "data-science",
    "title": "Data Science & Analytics",
    "topics": [
      { "id": "ds-intro", "title": "Introduction to Data Science" },
      { "id": "ds-stats", "title": "Statistics for Data Science" },
      { "id": "ds-viz", "title": "Data Visualization" }, # the frontend had "Data Visualization (Matplotlib/Seaborn)" - / is bad for folders
      { "id": "ds-sql", "title": "SQL for Data Science" }
    ]
  },
  {
    "id": "cybersecurity",
    "title": "Cybersecurity & Ethical Hacking",
    "topics": [
      { "id": "cyber-intro", "title": "Cyber Security for Beginners" },
      { "id": "cyber-net", "title": "Network Security" },
      { "id": "cyber-hacking", "title": "Ethical Hacking 101" },
      { "id": "cyber-def", "title": "Defensive Security" }
    ]
  },
  {
    "id": "os-networks",
    "title": "Operating Systems & Networks",
    "topics": [
      { "id": "os-intro", "title": "Operating Systems Overview" },
      { "id": "net-intro", "title": "Computer Networks Basics" },
      { "id": "os-process", "title": "Process Management" },
      { "id": "net-osi", "title": "The OSI Model" }
    ]
  },
  {
    "id": "mobile-dev",
    "title": "Mobile App Development",
    "topics": [
      { "id": "mob-intro", "title": "Intro to Mobile Development" },
      { "id": "mob-flutter", "title": "Flutter Basics" },
      { "id": "mob-react", "title": "React Native Crash Course" },
      { "id": "mob-native", "title": "Android vs iOS Native" }
    ]
  }
]

base_dir = r"d:\Projects\TutorAI\TutorAi\uploads\courses"

# Remove the old folders (which were named by id)
if os.path.exists(base_dir):
    shutil.rmtree(base_dir)

os.makedirs(base_dir)

def safe_folder_name(name):
    return name.replace("/", "-").replace("\\", "-").replace(":", "-").replace("*", "-").replace("?", "-").replace("\"", "-").replace("<", "-").replace(">", "-").replace("|", "-")

for course in course_data:
    course_name = safe_folder_name(course["title"])
    for topic in course["topics"]:
        topic_name = safe_folder_name(topic["title"])
        p = os.path.join(base_dir, course_name, topic_name)
        if not os.path.exists(p):
            os.makedirs(p)

print("Folders created successfully with human-readable titles.")
