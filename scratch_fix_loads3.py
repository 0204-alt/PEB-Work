import os
import glob

loads_dir = r"c:\Users\lenovo\Desktop\New folder\packages\engineering-core\src\loads"

for filepath in glob.glob(os.path.join(loads_dir, "*.ts")):
    with open(filepath, "r") as f:
        content = f.read()

    # Fix variables and return types
    # from: NonNullable<LoadCase["applications"]>
    # to: any[]
    new_content = content.replace('NonNullable<LoadCase["applications"]>', 'any[]')
    
    if content != new_content:
        with open(filepath, "w") as f:
            f.write(new_content)
