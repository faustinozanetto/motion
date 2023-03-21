import { ValueKeyframe, ValueKeyframesDefinition } from "../animation/types"
import { isKeyframesTarget } from "../animation/utils/is-keyframes-target"
import { CustomValueType } from "../motion/types"

export const isCustomValue = (v: any): v is CustomValueType => {
    return Boolean(v && typeof v === "object" && v.mix && v.toValue)
}

export const resolveFinalValueInKeyframes = (
    v: ValueKeyframesDefinition
): ValueKeyframe => {
    // TODO maybe throw if v.length - 1 is placeholder token?
    return isKeyframesTarget(v) ? v[v.length - 1] || 0 : v
}
