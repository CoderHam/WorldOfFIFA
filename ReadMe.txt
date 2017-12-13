Installation Guide

***
Install BREW:
  ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

***
Install nodejs using BREW:
  brew install node

***
Install the necessary R packages by running this in RStudio:
install.packages(c("grImport", "XML", "ggplot2","gridExtra"), dependencies = TRUE)

***
Once nodejs is install, to install the necessary packages by:
  npm install async express fast-csv fs http jimp r-script url

***
Then run the server as:
  node vis_human.js

Server has started.
Please paste the following URL to your folder
http://localhost:8080/?country=Spain&atb=Stamina&wage_min=1&wage_max=99&age_min=15&age_max=45
