import re

with open("src/app/components/pg1.jsx", "r") as f:
    content = f.read()

content = content.replace("// Roadmap to Innovation", "{'// Roadmap to Innovation'}")

with open("src/app/components/pg1.jsx", "w") as f:
    f.write(content)

