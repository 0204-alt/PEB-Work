import os
import glob
import re

loads_dir = r"c:\Users\lenovo\Desktop\New folder\packages\engineering-core\src\loads"

for filepath in glob.glob(os.path.join(loads_dir, "*.ts")):
    with open(filepath, "r") as f:
        content = f.read()

    new_content = re.sub(r'const apps: (.*?) = \[\];', r'const apps: any[] = [];', content)
    new_content = re.sub(r'const applications: (.*?) = \[\];', r'const applications: any[] = [];', new_content)
    
    if content != new_content:
        with open(filepath, "w") as f:
            f.write(new_content)
