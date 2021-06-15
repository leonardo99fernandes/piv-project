export const mapRange = (num, in_min, in_max, out_min, out_max) => {
    let value = (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    value  = value < out_min ? out_min : value;
    value = value > out_max ? out_max : value;
    return value;
}