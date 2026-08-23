import os
import glob
import re

loads_dir = r"c:\Users\lenovo\Desktop\New folder\packages\engineering-core\src\loads"

for filepath in glob.glob(os.path.join(loads_dir, "*.ts")):
    with open(filepath, "r") as f:
        content = f.read()

    # Fix import statement
    # from: import { Geometry, LoadCase, LoadCase["applications"][0] } from "../types";
    # to: import { Geometry, LoadCase } from "../types";
    # Also handle combinations like `LoadCase, LoadCase["applications"][0]` or `LoadCase["applications"][0], LoadCase`
    content = content.replace(', LoadCase["applications"][0]', '')
    content = content.replace('LoadCase["applications"][0], ', '')
    content = content.replace('LoadCase["applications"][0]', '')

    # Fix variables and return types
    # from: LoadCase["applications"][0][]
    # to: NonNullable<LoadCase["applications"]>
    content = content.replace('LoadCase["applications"][0][]', 'NonNullable<LoadCase["applications"]>')
    
    with open(filepath, "w") as f:
        f.write(content)
