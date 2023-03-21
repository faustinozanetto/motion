import { createContext } from "react"
import { Transition } from "../animation/types"
import { TransformPoint } from "../projection/geometry/types"

export type ReducedMotionConfig = "always" | "never" | "user"

/**
 * @public
 */
export interface MotionConfigContext {
    /**
     * Internal, exported only for usage in Framer
     */
    transformPagePoint: TransformPoint

    /**
     * Internal. Determines whether this is a static context ie the Framer canvas. If so,
     * it'll disable all dynamic functionality.
     */
    isStatic: boolean

    /**
     * Defines a new default transition for the entire tree.
     *
     * @public
     */
    transition?: Transition

    /**
     * If true, will respect the device prefersReducedMotion setting by switching
     * transform animations off.
     *
     * @public
     */
    reducedMotion?: ReducedMotionConfig
}

/**
 * @public
 */
export const MotionConfigContext = createContext<MotionConfigContext>({
    transformPagePoint: (p) => p,
    isStatic: false,
    reducedMotion: "never",
})
