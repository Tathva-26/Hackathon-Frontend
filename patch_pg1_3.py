import re

with open("src/app/components/pg1.jsx", "r") as f:
    content = f.read()

content = content.replace("total * 0.5", "total * 0.6666")

with open("src/app/components/pg1.jsx", "w") as f:
    f.write(content)

