const subtract = (v1, v2) => {
  return v1.map((value, index) => value - v2[index]);
};

const dotProduct = (v1, v2) => {
  return v1.reduce((sum, value, index) => sum + value * v2[index], 0);
};

const magnitude = (v) => {
  return Math.sqrt(v.reduce((sum, value) => sum + value ** 2, 0));
};

const degrees = (radians) => {
  return (radians * 180) / Math.PI;
};

const calculateAngle = (bodyJoints) => {
  const { wrist, shoulderSide, shoulderSpine, baseSpine } = bodyJoints;

  const newWrist = wrist.map(
    (value, idx) => value + shoulderSpine[idx] - shoulderSide[idx]
  );

  const v1 = subtract(newWrist, shoulderSpine);
  const v2 = subtract(baseSpine, shoulderSpine);

  const angle = degrees(
    Math.acos(dotProduct(v1, v2) / (magnitude(v1) * magnitude(v2)))
  );

  return angle;
};

const getBodyJoints = (joints, angleType) => {
  const bodyConfig = {
    wrist: angleType === "alpha" ? 10 : 6,
    shoulderSide: angleType === "alpha" ? 8 : 4,
    shoulderSpine: 20,
    baseSpine: 0,
  };

  const bodyJoints = Object.entries(bodyConfig).reduce((res, [key, index]) => {
    const { cameraX, cameraY, cameraZ } = joints[index];
    res[key] = [cameraX, cameraY, cameraZ];
    return res;
  }, {});

  return bodyJoints;
};

const bodyPostureChecking = (body) => {
  const fullJoints = body.joints;

  const rightJoints = getBodyJoints(fullJoints, "alpha");
  const leftJoints = getBodyJoints(fullJoints, "beta");

  const rightAngle = calculateAngle(rightJoints);
  const leftAngle = calculateAngle(leftJoints);

  return { rightAngle, leftAngle };
};

export const calculateAccuracy = (body, target) => {
  if (!body) return 0;

  const { rightAngle, leftAngle } = bodyPostureChecking(body);

  return (
    100 -
    (5 / 18) *
      (Math.abs(rightAngle - target.alpha) + Math.abs(leftAngle - target.beta))
  );
};

export const averageAccuracy = (accuracies) => {
  if (!accuracies) return 0;

  let sum = 0;
  for(let i = 0; i < accuracies.length; i++) {
    sum += accuracies[i];
  }
  return sum/accuracies.length;
};