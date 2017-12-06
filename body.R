library(grImport)
library(XML)
library(gridExtra)
library(ggplot2)
#function to change the rgb color of the xml paths
changeColor<-function(bodypart,color){
  node<-xpathSApply(doc, paste("//path[@id='",bodypart,"']/context/rgb",sep=""))[[1]]
  rgbCol<-col2rgb(color)
  xmlAttrs(node)["r"]=rgbCol[1]/255
  xmlAttrs(node)["g"]=rgbCol[2]/255
  xmlAttrs(node)["b"]=rgbCol[3]/255
}

#read the xml image
doc<-xmlParse("Human_body_front_and_side.ps.xml")
#
#these are the different parts you can change

#color the bodyparts with random color
build_image <- function(number){
  bodyparts<-c("head","hand-right","hand-left","foot-left","foot-right","lowerleg-left","lowerleg-right","upperleg-left","upperleg-right","torso","forearm-right","forearm-left","upperarm-right","upperarm-left")
  fname <- paste("color_lists/color_list",number,".txt", sep="")
  color_list <- readLines(fname)
  #color_list <- c("#aa00aa","#550055")
  mapply(function(x,y){changeColor(x,y)},bodyparts,color_list)
  #load the XML as a picture
  body<-readPicture(saveXML(doc))
  #plot it
  gridF <- grid.arrange(pictureGrob(body), ncol=1)
  ggsave(filename=paste("public/player",number,".png",sep = ""), plot=gridF, scale = 0.2)
}
for (n in 1:12){
  build_image(n) 
}

