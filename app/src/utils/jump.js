let kinectron = null;
let basehead = null;
let jumping = false;

export function initKinectron(kinectAddress) {
    // define and create an instance of kinectron
    kinectron = new Kinectron(kinectAddress);
  
    // Set kinect type to "azure" or "windows"
    kinectron.setKinectType("windows");
  
    // connect with application over peer
    kinectron.makeConnection();
  
    // request all tracked bodies and pass data to your callback
    kinectron.startTrackedBodies(jumpDetection);
}

export function jumpDetection(body) {
    var head = body.joints[kinectron.HEAD];

    if(basehead === null) {
        basehead = head.depthY*height;
    }

    if(!jumping && basehead - head.depthY*height >= 50) {
        jumping = true;
        console.log("JUMP DETECTED!!!!!");
    } else if(jumping && basehead - head.depthY*height < 50) {
        jumping = false;
    }
}