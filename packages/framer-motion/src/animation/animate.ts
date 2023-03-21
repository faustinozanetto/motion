import { resolveElements } from "../render/dom/utils/resolve-element"
import { visualElementStore } from "../render/store"
import { invariant } from "../utils/errors"
import { MotionValue } from "../value"
import { GroupPlaybackControls } from "./GroupPlaybackControls"
import {
    AnimationPlaybackControls,
    AnimationScope,
    DOMKeyframesDefinition,
    ElementOrSelector,
    GenericKeyframes,
    TransitionWithOverrides,
    TransitionWithPlaybackLifecycles,
} from "./types"
import { isDOMKeyframes } from "./utils/is-dom-keyframes"
import { animateTarget } from "./interfaces/visual-element-target"
import { createVisualElement } from "./utils/create-visual-element"
import { animateSingleValue } from "./interfaces/single-value"

function animateElements(
    elementOrSelector: ElementOrSelector,
    keyframes: DOMKeyframesDefinition,
    options: TransitionWithOverrides,
    scope?: AnimationScope
): AnimationPlaybackControls {
    const elements = resolveElements(elementOrSelector, scope)
    const numElements = elements.length

    invariant(Boolean(numElements), "No valid element provided.")

    const animations: AnimationPlaybackControls[] = []

    for (let i = 0; i < numElements; i++) {
        const element = elements[i]

        /**
         * Check each element for an associated VisualElement. If none exists,
         * we need to create one.
         */
        if (!visualElementStore.has(element)) {
            /**
             * TODO: We only need render-specific parts of the VisualElement.
             * With some additional work the size of the animate() function
             * could be reduced significantly.
             */
            createVisualElement(element as HTMLElement | SVGElement)
        }

        const visualElement = visualElementStore.get(element)!

        animations.push(
            ...animateTarget(
                visualElement,
                { ...keyframes, transition: options } as any,
                {}
            )
        )
    }

    return new GroupPlaybackControls(animations)
}

export const createScopedAnimate = (scope?: AnimationScope) => {
    /**
     * Animate a single value
     */
    function scopedAnimate(
        from: string,
        to: string | GenericKeyframes<string>,
        options?: TransitionWithPlaybackLifecycles<string>
    ): AnimationPlaybackControls
    function scopedAnimate(
        from: number,
        to: number | GenericKeyframes<number>,
        options?: TransitionWithPlaybackLifecycles<number>
    ): AnimationPlaybackControls
    /**
     * Animate a MotionValue
     */
    function scopedAnimate(
        value: MotionValue<string>,
        keyframes: string | GenericKeyframes<string>,
        options?: TransitionWithPlaybackLifecycles<string>
    ): AnimationPlaybackControls
    function scopedAnimate(
        value: MotionValue<number>,
        keyframes: number | GenericKeyframes<number>,
        options?: TransitionWithPlaybackLifecycles<number>
    ): AnimationPlaybackControls
    /**
     * Animate DOM
     */
    function scopedAnimate(
        value: ElementOrSelector,
        keyframes: DOMKeyframesDefinition,
        options?: TransitionWithOverrides
    ): AnimationPlaybackControls
    function scopedAnimate<V>(
        valueOrElement: ElementOrSelector | MotionValue<V> | V,
        keyframes: DOMKeyframesDefinition | V | GenericKeyframes<V>,
        options: TransitionWithPlaybackLifecycles | TransitionWithOverrides = {}
    ): AnimationPlaybackControls {
        let animation: AnimationPlaybackControls

        if (isDOMKeyframes(keyframes)) {
            animation = animateElements(
                valueOrElement as ElementOrSelector,
                keyframes,
                options as TransitionWithOverrides,
                scope
            )
        } else {
            animation = animateSingleValue(valueOrElement, keyframes, options)
        }

        if (scope) {
            scope.animations.push(animation)
        }

        return animation
    }

    return scopedAnimate
}

export const animate = createScopedAnimate()
