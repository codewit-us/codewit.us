import { ComponentProps, forwardRef } from "react";

import { cn } from "../utils/styles";

/*
 * since some of the header elements currently being used on the site seem
 * somewhat arbitrary, the only consistent styling is just the highlight
 * color.
 *
 * when we want more consistency we can use these to enforce specific
 * styling.
 *
 * the current elements (2026/04/24) are 1:1 replacement for base html
 * elements and only modify the styling and everything else is just passed
 * through without changes.
 */

export const H1 = forwardRef<HTMLHeadingElement, ComponentProps<"h1">>(({className, ...props}, ref) => {
    return <h1
        ref={ref}
        className={cn("text-highlight-500", className)}
        {...props}
    />;
});
H1.displayName = "H1";

export const H2 = forwardRef<HTMLHeadingElement, ComponentProps<"h2">>(({className, ...props}, ref) => {
    return <h2
        ref={ref}
        className={cn("text-highlight-500", className)}
        {...props}
    />;
});
H2.displayName = "H2";

export const H3 = forwardRef<HTMLHeadingElement, ComponentProps<"h3">>(({className, ...props}, ref) => {
    return <h3
        ref={ref}
        className={cn("text-highlight-500", className)}
        {...props}
    />;
});
H3.displayName = "H3";

export const H4 = forwardRef<HTMLHeadingElement, ComponentProps<"h4">>(({className, ...props}, ref) => {
    return <h4
        ref={ref}
        className={cn("text-highlight-500", className)}
        {...props}
    />;
});
H4.displayName = "H4";

export const H5 = forwardRef<HTMLHeadingElement, ComponentProps<"h5">>(({className, ...props}, ref) => {
    return <h5
        ref={ref}
        className={cn("text-highlight-500", className)}
        {...props}
    />;
});
H5.displayName = "H5";
