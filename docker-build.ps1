# Get the package version from the package.json then build with docker build
$PACKAGE_VERSION = (node -p -e "require('./package.json').version")
docker build -t luketillman/killrvideo-web:latest -t "luketillman/killrvideo-web:$PACKAGE_VERSION" .