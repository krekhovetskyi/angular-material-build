import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Overlay, } from '@angular/cdk/overlay';
import { Platform, normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { ComponentPortal } from '@angular/cdk/portal';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Directive, ElementRef, Inject, InjectionToken, Input, NgZone, Optional, ViewContainerRef, ViewEncapsulation, } from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { matTooltipAnimations } from './tooltip-animations';
/** Time in ms to throttle repositioning after scroll events. */
export const SCROLL_THROTTLE_MS = 20;
/** CSS class that will be attached to the overlay panel. */
export const TOOLTIP_PANEL_CLASS = 'mat-tooltip-panel';
/** Options used to bind passive event listeners. */
const passiveListenerOptions = normalizePassiveListenerOptions({ passive: true });
/**
 * Time between the user putting the pointer on a tooltip
 * trigger and the long press event being fired.
 */
const LONGPRESS_DELAY = 500;
/**
 * Creates an error to be thrown if the user supplied an invalid tooltip position.
 * @docs-private
 */
export function getMatTooltipInvalidPositionError(position) {
    return Error(`Tooltip position "${position}" is invalid.`);
}
/** Injection token that determines the scroll handling while a tooltip is visible. */
export const MAT_TOOLTIP_SCROLL_STRATEGY = new InjectionToken('mat-tooltip-scroll-strategy');
/** @docs-private */
export function MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY(overlay) {
    return () => overlay.scrollStrategies.reposition({ scrollThrottle: SCROLL_THROTTLE_MS });
}
/** @docs-private */
export const MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: MAT_TOOLTIP_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY,
};
/** Injection token to be used to override the default options for `matTooltip`. */
export const MAT_TOOLTIP_DEFAULT_OPTIONS = new InjectionToken('mat-tooltip-default-options', {
    providedIn: 'root',
    factory: MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY
});
/** @docs-private */
export function MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY() {
    return {
        showDelay: 0,
        hideDelay: 0,
        touchendHideDelay: 1500,
    };
}
/**
 * Directive that attaches a material design tooltip to the host element. Animates the showing and
 * hiding of a tooltip provided position (defaults to below the element).
 *
 * https://material.io/design/components/tooltips.html
 */
export class MatTooltip {
    constructor(_overlay, _elementRef, _scrollDispatcher, _viewContainerRef, _ngZone, _platform, _ariaDescriber, _focusMonitor, scrollStrategy, _dir, _defaultOptions) {
        this._overlay = _overlay;
        this._elementRef = _elementRef;
        this._scrollDispatcher = _scrollDispatcher;
        this._viewContainerRef = _viewContainerRef;
        this._ngZone = _ngZone;
        this._platform = _platform;
        this._ariaDescriber = _ariaDescriber;
        this._focusMonitor = _focusMonitor;
        this._dir = _dir;
        this._defaultOptions = _defaultOptions;
        this._position = 'below';
        this._disabled = false;
        this._viewInitialized = false;
        this._pointerExitEventsInitialized = false;
        /** The default delay in ms before showing the tooltip after show is called */
        this.showDelay = this._defaultOptions.showDelay;
        /** The default delay in ms before hiding the tooltip after hide is called */
        this.hideDelay = this._defaultOptions.hideDelay;
        /**
         * How touch gestures should be handled by the tooltip. On touch devices the tooltip directive
         * uses a long press gesture to show and hide, however it can conflict with the native browser
         * gestures. To work around the conflict, Angular Material disables native gestures on the
         * trigger, but that might not be desirable on particular elements (e.g. inputs and draggable
         * elements). The different values for this option configure the touch event handling as follows:
         * - `auto` - Enables touch gestures for all elements, but tries to avoid conflicts with native
         *   browser gestures on particular elements. In particular, it allows text selection on inputs
         *   and textareas, and preserves the native browser dragging on elements marked as `draggable`.
         * - `on` - Enables touch gestures for all elements and disables native
         *   browser gestures with no exceptions.
         * - `off` - Disables touch gestures. Note that this will prevent the tooltip from
         *   showing on touch devices.
         */
        this.touchGestures = 'auto';
        this._message = '';
        /** Manually-bound passive event listeners. */
        this._passiveListeners = [];
        /** Emits when the component is destroyed. */
        this._destroyed = new Subject();
        /**
         * Handles the keydown events on the host element.
         * Needs to be an arrow function so that we can use it in addEventListener.
         */
        this._handleKeydown = (event) => {
            if (this._isTooltipVisible() && event.keyCode === ESCAPE && !hasModifierKey(event)) {
                event.preventDefault();
                event.stopPropagation();
                this._ngZone.run(() => this.hide(0));
            }
        };
        this._scrollStrategy = scrollStrategy;
        if (_defaultOptions) {
            if (_defaultOptions.position) {
                this.position = _defaultOptions.position;
            }
            if (_defaultOptions.touchGestures) {
                this.touchGestures = _defaultOptions.touchGestures;
            }
        }
        _ngZone.runOutsideAngular(() => {
            _elementRef.nativeElement.addEventListener('keydown', this._handleKeydown);
        });
    }
    /** Allows the user to define the position of the tooltip relative to the parent element */
    get position() { return this._position; }
    set position(value) {
        if (value !== this._position) {
            this._position = value;
            if (this._overlayRef) {
                this._updatePosition();
                if (this._tooltipInstance) {
                    this._tooltipInstance.show(0);
                }
                this._overlayRef.updatePosition();
            }
        }
    }
    /** Disables the display of the tooltip. */
    get disabled() { return this._disabled; }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
        // If tooltip is disabled, hide immediately.
        if (this._disabled) {
            this.hide(0);
        }
        else {
            this._setupPointerEnterEventsIfNeeded();
        }
    }
    /** The message to be displayed in the tooltip */
    get message() { return this._message; }
    set message(value) {
        this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this._message);
        // If the message is not a string (e.g. number), convert it to a string and trim it.
        this._message = value != null ? `${value}`.trim() : '';
        if (!this._message && this._isTooltipVisible()) {
            this.hide(0);
        }
        else {
            this._setupPointerEnterEventsIfNeeded();
            this._updateTooltipMessage();
            this._ngZone.runOutsideAngular(() => {
                // The `AriaDescriber` has some functionality that avoids adding a description if it's the
                // same as the `aria-label` of an element, however we can't know whether the tooltip trigger
                // has a data-bound `aria-label` or when it'll be set for the first time. We can avoid the
                // issue by deferring the description by a tick so Angular has time to set the `aria-label`.
                Promise.resolve().then(() => {
                    this._ariaDescriber.describe(this._elementRef.nativeElement, this.message);
                });
            });
        }
    }
    /** Classes to be passed to the tooltip. Supports the same syntax as `ngClass`. */
    get tooltipClass() { return this._tooltipClass; }
    set tooltipClass(value) {
        this._tooltipClass = value;
        if (this._tooltipInstance) {
            this._setTooltipClass(this._tooltipClass);
        }
    }
    ngAfterViewInit() {
        // This needs to happen after view init so the initial values for all inputs have been set.
        this._viewInitialized = true;
        this._setupPointerEnterEventsIfNeeded();
        this._focusMonitor.monitor(this._elementRef)
            .pipe(takeUntil(this._destroyed))
            .subscribe(origin => {
            // Note that the focus monitor runs outside the Angular zone.
            if (!origin) {
                this._ngZone.run(() => this.hide(0));
            }
            else if (origin === 'keyboard') {
                this._ngZone.run(() => this.show());
            }
        });
    }
    /**
     * Dispose the tooltip when destroyed.
     */
    ngOnDestroy() {
        const nativeElement = this._elementRef.nativeElement;
        clearTimeout(this._touchstartTimeout);
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._tooltipInstance = null;
        }
        // Clean up the event listeners set in the constructor
        nativeElement.removeEventListener('keydown', this._handleKeydown);
        this._passiveListeners.forEach(([event, listener]) => {
            nativeElement.removeEventListener(event, listener, passiveListenerOptions);
        });
        this._passiveListeners.length = 0;
        this._destroyed.next();
        this._destroyed.complete();
        this._ariaDescriber.removeDescription(nativeElement, this.message);
        this._focusMonitor.stopMonitoring(nativeElement);
    }
    /** Shows the tooltip after the delay in ms, defaults to tooltip-delay-show or 0ms if no input */
    show(delay = this.showDelay) {
        if (this.disabled || !this.message || (this._isTooltipVisible() &&
            !this._tooltipInstance._showTimeoutId && !this._tooltipInstance._hideTimeoutId)) {
            return;
        }
        const overlayRef = this._createOverlay();
        this._detach();
        this._portal = this._portal || new ComponentPortal(TooltipComponent, this._viewContainerRef);
        this._tooltipInstance = overlayRef.attach(this._portal).instance;
        this._tooltipInstance.afterHidden()
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => this._detach());
        this._setTooltipClass(this._tooltipClass);
        this._updateTooltipMessage();
        this._tooltipInstance.show(delay);
    }
    /** Hides the tooltip after the delay in ms, defaults to tooltip-delay-hide or 0ms if no input */
    hide(delay = this.hideDelay) {
        if (this._tooltipInstance) {
            this._tooltipInstance.hide(delay);
        }
    }
    /** Shows/hides the tooltip */
    toggle() {
        this._isTooltipVisible() ? this.hide() : this.show();
    }
    /** Returns true if the tooltip is currently visible to the user */
    _isTooltipVisible() {
        return !!this._tooltipInstance && this._tooltipInstance.isVisible();
    }
    /** Create the overlay config and position strategy */
    _createOverlay() {
        if (this._overlayRef) {
            return this._overlayRef;
        }
        const scrollableAncestors = this._scrollDispatcher.getAncestorScrollContainers(this._elementRef);
        // Create connected position strategy that listens for scroll events to reposition.
        const strategy = this._overlay.position()
            .flexibleConnectedTo(this._elementRef)
            .withTransformOriginOn('.mat-tooltip')
            .withFlexibleDimensions(false)
            .withViewportMargin(8)
            .withScrollableContainers(scrollableAncestors);
        strategy.positionChanges.pipe(takeUntil(this._destroyed)).subscribe(change => {
            this._updateCurrentPositionClass(change.connectionPair);
            if (this._tooltipInstance) {
                if (change.scrollableViewProperties.isOverlayClipped && this._tooltipInstance.isVisible()) {
                    // After position changes occur and the overlay is clipped by
                    // a parent scrollable then close the tooltip.
                    this._ngZone.run(() => this.hide(0));
                }
            }
        });
        this._overlayRef = this._overlay.create({
            direction: this._dir,
            positionStrategy: strategy,
            panelClass: TOOLTIP_PANEL_CLASS,
            scrollStrategy: this._scrollStrategy()
        });
        this._updatePosition();
        this._overlayRef.detachments()
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => this._detach());
        return this._overlayRef;
    }
    /** Detaches the currently-attached tooltip. */
    _detach() {
        if (this._overlayRef && this._overlayRef.hasAttached()) {
            this._overlayRef.detach();
        }
        this._tooltipInstance = null;
    }
    /** Updates the position of the current tooltip. */
    _updatePosition() {
        const position = this._overlayRef.getConfig().positionStrategy;
        const origin = this._getOrigin();
        const overlay = this._getOverlayPosition();
        position.withPositions([
            Object.assign(Object.assign({}, origin.main), overlay.main),
            Object.assign(Object.assign({}, origin.fallback), overlay.fallback)
        ]);
    }
    /**
     * Returns the origin position and a fallback position based on the user's position preference.
     * The fallback position is the inverse of the origin (e.g. `'below' -> 'above'`).
     */
    _getOrigin() {
        const isLtr = !this._dir || this._dir.value == 'ltr';
        const position = this.position;
        let originPosition;
        if (position == 'above' || position == 'below') {
            originPosition = { originX: 'center', originY: position == 'above' ? 'top' : 'bottom' };
        }
        else if (position == 'before' ||
            (position == 'left' && isLtr) ||
            (position == 'right' && !isLtr)) {
            originPosition = { originX: 'start', originY: 'center' };
        }
        else if (position == 'after' ||
            (position == 'right' && isLtr) ||
            (position == 'left' && !isLtr)) {
            originPosition = { originX: 'end', originY: 'center' };
        }
        else if (typeof ngDevMode === 'undefined' || ngDevMode) {
            throw getMatTooltipInvalidPositionError(position);
        }
        const { x, y } = this._invertPosition(originPosition.originX, originPosition.originY);
        return {
            main: originPosition,
            fallback: { originX: x, originY: y }
        };
    }
    /** Returns the overlay position and a fallback position based on the user's preference */
    _getOverlayPosition() {
        const isLtr = !this._dir || this._dir.value == 'ltr';
        const position = this.position;
        let overlayPosition;
        if (position == 'above') {
            overlayPosition = { overlayX: 'center', overlayY: 'bottom' };
        }
        else if (position == 'below') {
            overlayPosition = { overlayX: 'center', overlayY: 'top' };
        }
        else if (position == 'before' ||
            (position == 'left' && isLtr) ||
            (position == 'right' && !isLtr)) {
            overlayPosition = { overlayX: 'end', overlayY: 'center' };
        }
        else if (position == 'after' ||
            (position == 'right' && isLtr) ||
            (position == 'left' && !isLtr)) {
            overlayPosition = { overlayX: 'start', overlayY: 'center' };
        }
        else if (typeof ngDevMode === 'undefined' || ngDevMode) {
            throw getMatTooltipInvalidPositionError(position);
        }
        const { x, y } = this._invertPosition(overlayPosition.overlayX, overlayPosition.overlayY);
        return {
            main: overlayPosition,
            fallback: { overlayX: x, overlayY: y }
        };
    }
    /** Updates the tooltip message and repositions the overlay according to the new message length */
    _updateTooltipMessage() {
        // Must wait for the message to be painted to the tooltip so that the overlay can properly
        // calculate the correct positioning based on the size of the text.
        if (this._tooltipInstance) {
            this._tooltipInstance.message = this.message;
            this._tooltipInstance._markForCheck();
            this._ngZone.onMicrotaskEmpty.pipe(take(1), takeUntil(this._destroyed)).subscribe(() => {
                if (this._tooltipInstance) {
                    this._overlayRef.updatePosition();
                }
            });
        }
    }
    /** Updates the tooltip class */
    _setTooltipClass(tooltipClass) {
        if (this._tooltipInstance) {
            this._tooltipInstance.tooltipClass = tooltipClass;
            this._tooltipInstance._markForCheck();
        }
    }
    /** Inverts an overlay position. */
    _invertPosition(x, y) {
        if (this.position === 'above' || this.position === 'below') {
            if (y === 'top') {
                y = 'bottom';
            }
            else if (y === 'bottom') {
                y = 'top';
            }
        }
        else {
            if (x === 'end') {
                x = 'start';
            }
            else if (x === 'start') {
                x = 'end';
            }
        }
        return { x, y };
    }
    /** Updates the class on the overlay panel based on the current position of the tooltip. */
    _updateCurrentPositionClass(connectionPair) {
        const { overlayY, originX, originY } = connectionPair;
        let newPosition;
        // If the overlay is in the middle along the Y axis,
        // it means that it's either before or after.
        if (overlayY === 'center') {
            // Note that since this information is used for styling, we want to
            // resolve `start` and `end` to their real values, otherwise consumers
            // would have to remember to do it themselves on each consumption.
            if (this._dir && this._dir.value === 'rtl') {
                newPosition = originX === 'end' ? 'left' : 'right';
            }
            else {
                newPosition = originX === 'start' ? 'left' : 'right';
            }
        }
        else {
            newPosition = overlayY === 'bottom' && originY === 'top' ? 'above' : 'below';
        }
        if (newPosition !== this._currentPosition) {
            const overlayRef = this._overlayRef;
            if (overlayRef) {
                const classPrefix = 'mat-tooltip-panel-';
                overlayRef.removePanelClass(classPrefix + this._currentPosition);
                overlayRef.addPanelClass(classPrefix + newPosition);
            }
            this._currentPosition = newPosition;
        }
    }
    /** Binds the pointer events to the tooltip trigger. */
    _setupPointerEnterEventsIfNeeded() {
        // Optimization: Defer hooking up events if there's no message or the tooltip is disabled.
        if (this._disabled || !this.message || !this._viewInitialized ||
            this._passiveListeners.length) {
            return;
        }
        // The mouse events shouldn't be bound on mobile devices, because they can prevent the
        // first tap from firing its click event or can cause the tooltip to open for clicks.
        if (this._platformSupportsMouseEvents()) {
            this._passiveListeners
                .push(['mouseenter', () => {
                    this._setupPointerExitEventsIfNeeded();
                    this.show();
                }]);
        }
        else if (this.touchGestures !== 'off') {
            this._disableNativeGesturesIfNecessary();
            this._passiveListeners
                .push(['touchstart', () => {
                    // Note that it's important that we don't `preventDefault` here,
                    // because it can prevent click events from firing on the element.
                    this._setupPointerExitEventsIfNeeded();
                    clearTimeout(this._touchstartTimeout);
                    this._touchstartTimeout = setTimeout(() => this.show(), LONGPRESS_DELAY);
                }]);
        }
        this._addListeners(this._passiveListeners);
    }
    _setupPointerExitEventsIfNeeded() {
        if (this._pointerExitEventsInitialized) {
            return;
        }
        this._pointerExitEventsInitialized = true;
        const exitListeners = [];
        if (this._platformSupportsMouseEvents()) {
            exitListeners.push(['mouseleave', () => this.hide()]);
        }
        else if (this.touchGestures !== 'off') {
            this._disableNativeGesturesIfNecessary();
            const touchendListener = () => {
                clearTimeout(this._touchstartTimeout);
                this.hide(this._defaultOptions.touchendHideDelay);
            };
            exitListeners.push(['touchend', touchendListener], ['touchcancel', touchendListener]);
        }
        this._addListeners(exitListeners);
        this._passiveListeners.push(...exitListeners);
    }
    _addListeners(listeners) {
        listeners.forEach(([event, listener]) => {
            this._elementRef.nativeElement.addEventListener(event, listener, passiveListenerOptions);
        });
    }
    _platformSupportsMouseEvents() {
        return !this._platform.IOS && !this._platform.ANDROID;
    }
    /** Disables the native browser gestures, based on how the tooltip has been configured. */
    _disableNativeGesturesIfNecessary() {
        const gestures = this.touchGestures;
        if (gestures !== 'off') {
            const element = this._elementRef.nativeElement;
            const style = element.style;
            // If gestures are set to `auto`, we don't disable text selection on inputs and
            // textareas, because it prevents the user from typing into them on iOS Safari.
            if (gestures === 'on' || (element.nodeName !== 'INPUT' && element.nodeName !== 'TEXTAREA')) {
                style.userSelect = style.msUserSelect = style.webkitUserSelect =
                    style.MozUserSelect = 'none';
            }
            // If we have `auto` gestures and the element uses native HTML dragging,
            // we don't set `-webkit-user-drag` because it prevents the native behavior.
            if (gestures === 'on' || !element.draggable) {
                style.webkitUserDrag = 'none';
            }
            style.touchAction = 'none';
            style.webkitTapHighlightColor = 'transparent';
        }
    }
}
MatTooltip.decorators = [
    { type: Directive, args: [{
                selector: '[matTooltip]',
                exportAs: 'matTooltip',
                host: {
                    'class': 'mat-tooltip-trigger'
                }
            },] }
];
MatTooltip.ctorParameters = () => [
    { type: Overlay },
    { type: ElementRef },
    { type: ScrollDispatcher },
    { type: ViewContainerRef },
    { type: NgZone },
    { type: Platform },
    { type: AriaDescriber },
    { type: FocusMonitor },
    { type: undefined, decorators: [{ type: Inject, args: [MAT_TOOLTIP_SCROLL_STRATEGY,] }] },
    { type: Directionality, decorators: [{ type: Optional }] },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [MAT_TOOLTIP_DEFAULT_OPTIONS,] }] }
];
MatTooltip.propDecorators = {
    position: [{ type: Input, args: ['matTooltipPosition',] }],
    disabled: [{ type: Input, args: ['matTooltipDisabled',] }],
    showDelay: [{ type: Input, args: ['matTooltipShowDelay',] }],
    hideDelay: [{ type: Input, args: ['matTooltipHideDelay',] }],
    touchGestures: [{ type: Input, args: ['matTooltipTouchGestures',] }],
    message: [{ type: Input, args: ['matTooltip',] }],
    tooltipClass: [{ type: Input, args: ['matTooltipClass',] }]
};
/**
 * Internal component that wraps the tooltip's content.
 * @docs-private
 */
export class TooltipComponent {
    constructor(_changeDetectorRef, _breakpointObserver) {
        this._changeDetectorRef = _changeDetectorRef;
        this._breakpointObserver = _breakpointObserver;
        /** Property watched by the animation framework to show or hide the tooltip */
        this._visibility = 'initial';
        /** Whether interactions on the page should close the tooltip */
        this._closeOnInteraction = false;
        /** Subject for notifying that the tooltip has been hidden from the view */
        this._onHide = new Subject();
        /** Stream that emits whether the user has a handset-sized display.  */
        this._isHandset = this._breakpointObserver.observe(Breakpoints.Handset);
    }
    /**
     * Shows the tooltip with an animation originating from the provided origin
     * @param delay Amount of milliseconds to the delay showing the tooltip.
     */
    show(delay) {
        // Cancel the delayed hide if it is scheduled
        if (this._hideTimeoutId) {
            clearTimeout(this._hideTimeoutId);
            this._hideTimeoutId = null;
        }
        // Body interactions should cancel the tooltip if there is a delay in showing.
        this._closeOnInteraction = true;
        this._showTimeoutId = setTimeout(() => {
            this._visibility = 'visible';
            this._showTimeoutId = null;
            // Mark for check so if any parent component has set the
            // ChangeDetectionStrategy to OnPush it will be checked anyways
            this._markForCheck();
        }, delay);
    }
    /**
     * Begins the animation to hide the tooltip after the provided delay in ms.
     * @param delay Amount of milliseconds to delay showing the tooltip.
     */
    hide(delay) {
        // Cancel the delayed show if it is scheduled
        if (this._showTimeoutId) {
            clearTimeout(this._showTimeoutId);
            this._showTimeoutId = null;
        }
        this._hideTimeoutId = setTimeout(() => {
            this._visibility = 'hidden';
            this._hideTimeoutId = null;
            // Mark for check so if any parent component has set the
            // ChangeDetectionStrategy to OnPush it will be checked anyways
            this._markForCheck();
        }, delay);
    }
    /** Returns an observable that notifies when the tooltip has been hidden from view. */
    afterHidden() {
        return this._onHide;
    }
    /** Whether the tooltip is being displayed. */
    isVisible() {
        return this._visibility === 'visible';
    }
    ngOnDestroy() {
        this._onHide.complete();
    }
    _animationStart() {
        this._closeOnInteraction = false;
    }
    _animationDone(event) {
        const toState = event.toState;
        if (toState === 'hidden' && !this.isVisible()) {
            this._onHide.next();
        }
        if (toState === 'visible' || toState === 'hidden') {
            this._closeOnInteraction = true;
        }
    }
    /**
     * Interactions on the HTML body should close the tooltip immediately as defined in the
     * material design spec.
     * https://material.io/design/components/tooltips.html#behavior
     */
    _handleBodyInteraction() {
        if (this._closeOnInteraction) {
            this.hide(0);
        }
    }
    /**
     * Marks that the tooltip needs to be checked in the next change detection run.
     * Mainly used for rendering the initial text before positioning a tooltip, which
     * can be problematic in components with OnPush change detection.
     */
    _markForCheck() {
        this._changeDetectorRef.markForCheck();
    }
}
TooltipComponent.decorators = [
    { type: Component, args: [{
                selector: 'mat-tooltip-component',
                template: "<div class=\"mat-tooltip\"\n     [ngClass]=\"tooltipClass\"\n     [class.mat-tooltip-handset]=\"(_isHandset | async)?.matches\"\n     [@state]=\"_visibility\"\n     (@state.start)=\"_animationStart()\"\n     (@state.done)=\"_animationDone($event)\">{{message}}</div>\n",
                encapsulation: ViewEncapsulation.None,
                changeDetection: ChangeDetectionStrategy.OnPush,
                animations: [matTooltipAnimations.tooltipState],
                host: {
                    // Forces the element to have a layout in IE and Edge. This fixes issues where the element
                    // won't be rendered if the animations are disabled or there is no web animations polyfill.
                    '[style.zoom]': '_visibility === "visible" ? 1 : null',
                    '(body:click)': 'this._handleBodyInteraction()',
                    'aria-hidden': 'true',
                },
                styles: [".mat-tooltip-panel{pointer-events:none !important}.mat-tooltip{color:#fff;border-radius:4px;margin:14px;max-width:250px;padding-left:8px;padding-right:8px;overflow:hidden;text-overflow:ellipsis}.cdk-high-contrast-active .mat-tooltip{outline:solid 1px}.mat-tooltip-handset{margin:24px;padding-left:16px;padding-right:16px}\n"]
            },] }
];
TooltipComponent.ctorParameters = () => [
    { type: ChangeDetectorRef },
    { type: BreakpointObserver }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC90b29sdGlwL3Rvb2x0aXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUEsT0FBTyxFQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUM5RCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFlLHFCQUFxQixFQUFjLE1BQU0sdUJBQXVCLENBQUM7QUFDdkYsT0FBTyxFQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsa0JBQWtCLEVBQUUsV0FBVyxFQUFrQixNQUFNLHFCQUFxQixDQUFDO0FBQ3JGLE9BQU8sRUFJTCxPQUFPLEdBTVIsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLEVBQUMsUUFBUSxFQUFFLCtCQUErQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDaEYsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3BELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3hELE9BQU8sRUFDTCx1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxTQUFTLEVBQ1QsVUFBVSxFQUNWLE1BQU0sRUFDTixjQUFjLEVBQ2QsS0FBSyxFQUNMLE1BQU0sRUFFTixRQUFRLEVBQ1IsZ0JBQWdCLEVBQ2hCLGlCQUFpQixHQUVsQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQWEsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFL0MsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFlMUQsZ0VBQWdFO0FBQ2hFLE1BQU0sQ0FB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Q0FBQyxDQUFDLENBQUMsQ0FBQztTQUNkO0lBQ0gsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxhQUFhO1FBQ1gsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3pDLENBQUM7OztZQXhJRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLHVCQUF1QjtnQkFDakMsd1JBQTJCO2dCQUUzQixhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtnQkFDckMsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07Z0JBQy9DLFVBQVUsRUFBRSxDQUFDLG9CQUFvQixDQUFDLFlBQVksQ0FBQztnQkFDL0MsSUFBSSxFQUFFO29CQUNKLDBGQUEwRjtvQkFDMUYsMkZBQTJGO29CQUMzRixjQUFjLEVBQUUsc0NBQXNDO29CQUN0RCxjQUFjLEVBQUUsK0JBQStCO29CQUMvQyxhQUFhLEVBQUUsTUFBTTtpQkFDdEI7O2FBQ0Y7OztZQXBxQkMsaUJBQWlCO1lBakJYLGtCQUFrQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBbmltYXRpb25FdmVudH0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge0FyaWFEZXNjcmliZXIsIEZvY3VzTW9uaXRvcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSwgTnVtYmVySW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0VTQ0FQRSwgaGFzTW9kaWZpZXJLZXl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge0JyZWFrcG9pbnRPYnNlcnZlciwgQnJlYWtwb2ludHMsIEJyZWFrcG9pbnRTdGF0ZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2xheW91dCc7XG5pbXBvcnQge1xuICBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3ksXG4gIEhvcml6b250YWxDb25uZWN0aW9uUG9zLFxuICBPcmlnaW5Db25uZWN0aW9uUG9zaXRpb24sXG4gIE92ZXJsYXksXG4gIE92ZXJsYXlDb25uZWN0aW9uUG9zaXRpb24sXG4gIE92ZXJsYXlSZWYsXG4gIFNjcm9sbFN0cmF0ZWd5LFxuICBWZXJ0aWNhbENvbm5lY3Rpb25Qb3MsXG4gIENvbm5lY3Rpb25Qb3NpdGlvblBhaXIsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7UGxhdGZvcm0sIG5vcm1hbGl6ZVBhc3NpdmVMaXN0ZW5lck9wdGlvbnN9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge0NvbXBvbmVudFBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge1Njcm9sbERpc3BhdGNoZXJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9zY3JvbGxpbmcnO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgSW5qZWN0LFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIEFmdGVyVmlld0luaXQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcbmltcG9ydCB7dGFrZSwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7bWF0VG9vbHRpcEFuaW1hdGlvbnN9IGZyb20gJy4vdG9vbHRpcC1hbmltYXRpb25zJztcblxuXG4vKiogUG9zc2libGUgcG9zaXRpb25zIGZvciBhIHRvb2x0aXAuICovXG5leHBvcnQgdHlwZSBUb29sdGlwUG9zaXRpb24gPSAnbGVmdCcgfCAncmlnaHQnIHwgJ2Fib3ZlJyB8ICdiZWxvdycgfCAnYmVmb3JlJyB8ICdhZnRlcic7XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgaG93IHRoZSB0b29sdGlwIHRyaWdnZXIgc2hvdWxkIGhhbmRsZSB0b3VjaCBnZXN0dXJlcy5cbiAqIFNlZSBgTWF0VG9vbHRpcC50b3VjaEdlc3R1cmVzYCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqL1xuZXhwb3J0IHR5cGUgVG9vbHRpcFRvdWNoR2VzdHVyZXMgPSAnYXV0bycgfCAnb24nIHwgJ29mZic7XG5cbi8qKiBQb3NzaWJsZSB2aXNpYmlsaXR5IHN0YXRlcyBvZiBhIHRvb2x0aXAuICovXG5leHBvcnQgdHlwZSBUb29sdGlwVmlzaWJpbGl0eSA9ICdpbml0aWFsJyB8ICd2aXNpYmxlJyB8ICdoaWRkZW4nO1xuXG4vKiogVGltZSBpbiBtcyB0byB0aHJvdHRsZSByZXBvc2l0aW9uaW5nIGFmdGVyIHNjcm9sbCBldmVudHMuICovXG5leHBvcnQgY29uc3QgU0NST0xMX1RIUk9UVExFX01TID0gMjA7XG5cbi8qKiBDU1MgY2xhc3MgdGhhdCB3aWxsIGJlIGF0dGFjaGVkIHRvIHRoZSBvdmVybGF5IHBhbmVsLiAqL1xuZXhwb3J0IGNvbnN0IFRPT0xUSVBfUEFORUxfQ0xBU1MgPSAnbWF0LXRvb2x0aXAtcGFuZWwnO1xuXG4vKiogT3B0aW9ucyB1c2VkIHRvIGJpbmQgcGFzc2l2ZSBldmVudCBsaXN0ZW5lcnMuICovXG5jb25zdCBwYXNzaXZlTGlzdGVuZXJPcHRpb25zID0gbm9ybWFsaXplUGFzc2l2ZUxpc3RlbmVyT3B0aW9ucyh7cGFzc2l2ZTogdHJ1ZX0pO1xuXG4vKipcbiAqIFRpbWUgYmV0d2VlbiB0aGUgdXNlciBwdXR0aW5nIHRoZSBwb2ludGVyIG9uIGEgdG9vbHRpcFxuICogdHJpZ2dlciBhbmQgdGhlIGxvbmcgcHJlc3MgZXZlbnQgYmVpbmcgZmlyZWQuXG4gKi9cbmNvbnN0IExPTkdQUkVTU19ERUxBWSA9IDUwMDtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGVycm9yIHRvIGJlIHRocm93biBpZiB0aGUgdXNlciBzdXBwbGllZCBhbiBpbnZhbGlkIHRvb2x0aXAgcG9zaXRpb24uXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRNYXRUb29sdGlwSW52YWxpZFBvc2l0aW9uRXJyb3IocG9zaXRpb246IHN0cmluZykge1xuICByZXR1cm4gRXJyb3IoYFRvb2x0aXAgcG9zaXRpb24gXCIke3Bvc2l0aW9ufVwiIGlzIGludmFsaWQuYCk7XG59XG5cbi8qKiBJbmplY3Rpb24gdG9rZW4gdGhhdCBkZXRlcm1pbmVzIHRoZSBzY3JvbGwgaGFuZGxpbmcgd2hpbGUgYSB0b29sdGlwIGlzIHZpc2libGUuICovXG5leHBvcnQgY29uc3QgTUFUX1RPT0xUSVBfU0NST0xMX1NUUkFURUdZID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48KCkgPT4gU2Nyb2xsU3RyYXRlZ3k+KCdtYXQtdG9vbHRpcC1zY3JvbGwtc3RyYXRlZ3knKTtcblxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmV4cG9ydCBmdW5jdGlvbiBNQVRfVE9PTFRJUF9TQ1JPTExfU1RSQVRFR1lfRkFDVE9SWShvdmVybGF5OiBPdmVybGF5KTogKCkgPT4gU2Nyb2xsU3RyYXRlZ3kge1xuICByZXR1cm4gKCkgPT4gb3ZlcmxheS5zY3JvbGxTdHJhdGVnaWVzLnJlcG9zaXRpb24oe3Njcm9sbFRocm90dGxlOiBTQ1JPTExfVEhST1RUTEVfTVN9KTtcbn1cblxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmV4cG9ydCBjb25zdCBNQVRfVE9PTFRJUF9TQ1JPTExfU1RSQVRFR1lfRkFDVE9SWV9QUk9WSURFUiA9IHtcbiAgcHJvdmlkZTogTUFUX1RPT0xUSVBfU0NST0xMX1NUUkFURUdZLFxuICBkZXBzOiBbT3ZlcmxheV0sXG4gIHVzZUZhY3Rvcnk6IE1BVF9UT09MVElQX1NDUk9MTF9TVFJBVEVHWV9GQUNUT1JZLFxufTtcblxuLyoqIERlZmF1bHQgYG1hdFRvb2x0aXBgIG9wdGlvbnMgdGhhdCBjYW4gYmUgb3ZlcnJpZGRlbi4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWF0VG9vbHRpcERlZmF1bHRPcHRpb25zIHtcbiAgc2hvd0RlbGF5OiBudW1iZXI7XG4gIGhpZGVEZWxheTogbnVtYmVyO1xuICB0b3VjaGVuZEhpZGVEZWxheTogbnVtYmVyO1xuICB0b3VjaEdlc3R1cmVzPzogVG9vbHRpcFRvdWNoR2VzdHVyZXM7XG4gIHBvc2l0aW9uPzogVG9vbHRpcFBvc2l0aW9uO1xufVxuXG4vKiogSW5qZWN0aW9uIHRva2VuIHRvIGJlIHVzZWQgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb3B0aW9ucyBmb3IgYG1hdFRvb2x0aXBgLiAqL1xuZXhwb3J0IGNvbnN0IE1BVF9UT09MVElQX0RFRkFVTFRfT1BUSU9OUyA9XG4gICAgbmV3IEluamVjdGlvblRva2VuPE1hdFRvb2x0aXBEZWZhdWx0T3B0aW9ucz4oJ21hdC10b29sdGlwLWRlZmF1bHQtb3B0aW9ucycsIHtcbiAgICAgIHByb3ZpZGVkSW46ICdyb290JyxcbiAgICAgIGZhY3Rvcnk6IE1BVF9UT09MVElQX0RFRkFVTFRfT1BUSU9OU19GQUNUT1JZXG4gICAgfSk7XG5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5leHBvcnQgZnVuY3Rpb24gTUFUX1RPT0xUSVBfREVGQVVMVF9PUFRJT05TX0ZBQ1RPUlkoKTogTWF0VG9vbHRpcERlZmF1bHRPcHRpb25zIHtcbiAgcmV0dXJuIHtcbiAgICBzaG93RGVsYXk6IDAsXG4gICAgaGlkZURlbGF5OiAwLFxuICAgIHRvdWNoZW5kSGlkZURlbGF5OiAxNTAwLFxuICB9O1xufVxuXG4vKipcbiAqIERpcmVjdGl2ZSB0aGF0IGF0dGFjaGVzIGEgbWF0ZXJpYWwgZGVzaWduIHRvb2x0aXAgdG8gdGhlIGhvc3QgZWxlbWVudC4gQW5pbWF0ZXMgdGhlIHNob3dpbmcgYW5kXG4gKiBoaWRpbmcgb2YgYSB0b29sdGlwIHByb3ZpZGVkIHBvc2l0aW9uIChkZWZhdWx0cyB0byBiZWxvdyB0aGUgZWxlbWVudCkuXG4gKlxuICogaHR0cHM6Ly9tYXRlcmlhbC5pby9kZXNpZ24vY29tcG9uZW50cy90b29sdGlwcy5odG1sXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXRUb29sdGlwXScsXG4gIGV4cG9ydEFzOiAnbWF0VG9vbHRpcCcsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LXRvb2x0aXAtdHJpZ2dlcidcbiAgfVxufSlcbmV4cG9ydCBjbGFzcyBNYXRUb29sdGlwIGltcGxlbWVudHMgT25EZXN0cm95LCBBZnRlclZpZXdJbml0IHtcbiAgX292ZXJsYXlSZWY6IE92ZXJsYXlSZWYgfCBudWxsO1xuICBfdG9vbHRpcEluc3RhbmNlOiBUb29sdGlwQ29tcG9uZW50IHwgbnVsbDtcblxuICBwcml2YXRlIF9wb3J0YWw6IENvbXBvbmVudFBvcnRhbDxUb29sdGlwQ29tcG9uZW50PjtcbiAgcHJpdmF0ZSBfcG9zaXRpb246IFRvb2x0aXBQb3NpdGlvbiA9ICdiZWxvdyc7XG4gIHByaXZhdGUgX2Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX3Rvb2x0aXBDbGFzczogc3RyaW5nfHN0cmluZ1tdfFNldDxzdHJpbmc+fHtba2V5OiBzdHJpbmddOiBhbnl9O1xuICBwcml2YXRlIF9zY3JvbGxTdHJhdGVneTogKCkgPT4gU2Nyb2xsU3RyYXRlZ3k7XG4gIHByaXZhdGUgX3ZpZXdJbml0aWFsaXplZCA9IGZhbHNlO1xuICBwcml2YXRlIF9wb2ludGVyRXhpdEV2ZW50c0luaXRpYWxpemVkID0gZmFsc2U7XG4gIHByaXZhdGUgX2N1cnJlbnRQb3NpdGlvbjogVG9vbHRpcFBvc2l0aW9uO1xuXG4gIC8qKiBBbGxvd3MgdGhlIHVzZXIgdG8gZGVmaW5lIHRoZSBwb3NpdGlvbiBvZiB0aGUgdG9vbHRpcCByZWxhdGl2ZSB0byB0aGUgcGFyZW50IGVsZW1lbnQgKi9cbiAgQElucHV0KCdtYXRUb29sdGlwUG9zaXRpb24nKVxuICBnZXQgcG9zaXRpb24oKTogVG9vbHRpcFBvc2l0aW9uIHsgcmV0dXJuIHRoaXMuX3Bvc2l0aW9uOyB9XG4gIHNldCBwb3NpdGlvbih2YWx1ZTogVG9vbHRpcFBvc2l0aW9uKSB7XG4gICAgaWYgKHZhbHVlICE9PSB0aGlzLl9wb3NpdGlvbikge1xuICAgICAgdGhpcy5fcG9zaXRpb24gPSB2YWx1ZTtcblxuICAgICAgaWYgKHRoaXMuX292ZXJsYXlSZWYpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlUG9zaXRpb24oKTtcblxuICAgICAgICBpZiAodGhpcy5fdG9vbHRpcEluc3RhbmNlKSB7XG4gICAgICAgICAgdGhpcy5fdG9vbHRpcEluc3RhbmNlIS5zaG93KDApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fb3ZlcmxheVJlZi51cGRhdGVQb3NpdGlvbigpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBEaXNhYmxlcyB0aGUgZGlzcGxheSBvZiB0aGUgdG9vbHRpcC4gKi9cbiAgQElucHV0KCdtYXRUb29sdGlwRGlzYWJsZWQnKVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9kaXNhYmxlZDsgfVxuICBzZXQgZGlzYWJsZWQodmFsdWUpIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG5cbiAgICAvLyBJZiB0b29sdGlwIGlzIGRpc2FibGVkLCBoaWRlIGltbWVkaWF0ZWx5LlxuICAgIGlmICh0aGlzLl9kaXNhYmxlZCkge1xuICAgICAgdGhpcy5oaWRlKDApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zZXR1cFBvaW50ZXJFbnRlckV2ZW50c0lmTmVlZGVkKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFRoZSBkZWZhdWx0IGRlbGF5IGluIG1zIGJlZm9yZSBzaG93aW5nIHRoZSB0b29sdGlwIGFmdGVyIHNob3cgaXMgY2FsbGVkICovXG4gIEBJbnB1dCgnbWF0VG9vbHRpcFNob3dEZWxheScpIHNob3dEZWxheTogbnVtYmVyID0gdGhpcy5fZGVmYXVsdE9wdGlvbnMuc2hvd0RlbGF5O1xuXG4gIC8qKiBUaGUgZGVmYXVsdCBkZWxheSBpbiBtcyBiZWZvcmUgaGlkaW5nIHRoZSB0b29sdGlwIGFmdGVyIGhpZGUgaXMgY2FsbGVkICovXG4gIEBJbnB1dCgnbWF0VG9vbHRpcEhpZGVEZWxheScpIGhpZGVEZWxheTogbnVtYmVyID0gdGhpcy5fZGVmYXVsdE9wdGlvbnMuaGlkZURlbGF5O1xuXG4gIC8qKlxuICAgKiBIb3cgdG91Y2ggZ2VzdHVyZXMgc2hvdWxkIGJlIGhhbmRsZWQgYnkgdGhlIHRvb2x0aXAuIE9uIHRvdWNoIGRldmljZXMgdGhlIHRvb2x0aXAgZGlyZWN0aXZlXG4gICAqIHVzZXMgYSBsb25nIHByZXNzIGdlc3R1cmUgdG8gc2hvdyBhbmQgaGlkZSwgaG93ZXZlciBpdCBjYW4gY29uZmxpY3Qgd2l0aCB0aGUgbmF0aXZlIGJyb3dzZXJcbiAgICogZ2VzdHVyZXMuIFRvIHdvcmsgYXJvdW5kIHRoZSBjb25mbGljdCwgQW5ndWxhciBNYXRlcmlhbCBkaXNhYmxlcyBuYXRpdmUgZ2VzdHVyZXMgb24gdGhlXG4gICAqIHRyaWdnZXIsIGJ1dCB0aGF0IG1pZ2h0IG5vdCBiZSBkZXNpcmFibGUgb24gcGFydGljdWxhciBlbGVtZW50cyAoZS5nLiBpbnB1dHMgYW5kIGRyYWdnYWJsZVxuICAgKiBlbGVtZW50cykuIFRoZSBkaWZmZXJlbnQgdmFsdWVzIGZvciB0aGlzIG9wdGlvbiBjb25maWd1cmUgdGhlIHRvdWNoIGV2ZW50IGhhbmRsaW5nIGFzIGZvbGxvd3M6XG4gICAqIC0gYGF1dG9gIC0gRW5hYmxlcyB0b3VjaCBnZXN0dXJlcyBmb3IgYWxsIGVsZW1lbnRzLCBidXQgdHJpZXMgdG8gYXZvaWQgY29uZmxpY3RzIHdpdGggbmF0aXZlXG4gICAqICAgYnJvd3NlciBnZXN0dXJlcyBvbiBwYXJ0aWN1bGFyIGVsZW1lbnRzLiBJbiBwYXJ0aWN1bGFyLCBpdCBhbGxvd3MgdGV4dCBzZWxlY3Rpb24gb24gaW5wdXRzXG4gICAqICAgYW5kIHRleHRhcmVhcywgYW5kIHByZXNlcnZlcyB0aGUgbmF0aXZlIGJyb3dzZXIgZHJhZ2dpbmcgb24gZWxlbWVudHMgbWFya2VkIGFzIGBkcmFnZ2FibGVgLlxuICAgKiAtIGBvbmAgLSBFbmFibGVzIHRvdWNoIGdlc3R1cmVzIGZvciBhbGwgZWxlbWVudHMgYW5kIGRpc2FibGVzIG5hdGl2ZVxuICAgKiAgIGJyb3dzZXIgZ2VzdHVyZXMgd2l0aCBubyBleGNlcHRpb25zLlxuICAgKiAtIGBvZmZgIC0gRGlzYWJsZXMgdG91Y2ggZ2VzdHVyZXMuIE5vdGUgdGhhdCB0aGlzIHdpbGwgcHJldmVudCB0aGUgdG9vbHRpcCBmcm9tXG4gICAqICAgc2hvd2luZyBvbiB0b3VjaCBkZXZpY2VzLlxuICAgKi9cbiAgQElucHV0KCdtYXRUb29sdGlwVG91Y2hHZXN0dXJlcycpIHRvdWNoR2VzdHVyZXM6IFRvb2x0aXBUb3VjaEdlc3R1cmVzID0gJ2F1dG8nO1xuXG4gIC8qKiBUaGUgbWVzc2FnZSB0byBiZSBkaXNwbGF5ZWQgaW4gdGhlIHRvb2x0aXAgKi9cbiAgQElucHV0KCdtYXRUb29sdGlwJylcbiAgZ2V0IG1lc3NhZ2UoKSB7IHJldHVybiB0aGlzLl9tZXNzYWdlOyB9XG4gIHNldCBtZXNzYWdlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9hcmlhRGVzY3JpYmVyLnJlbW92ZURlc2NyaXB0aW9uKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgdGhpcy5fbWVzc2FnZSk7XG5cbiAgICAvLyBJZiB0aGUgbWVzc2FnZSBpcyBub3QgYSBzdHJpbmcgKGUuZy4gbnVtYmVyKSwgY29udmVydCBpdCB0byBhIHN0cmluZyBhbmQgdHJpbSBpdC5cbiAgICB0aGlzLl9tZXNzYWdlID0gdmFsdWUgIT0gbnVsbCA/IGAke3ZhbHVlfWAudHJpbSgpIDogJyc7XG5cbiAgICBpZiAoIXRoaXMuX21lc3NhZ2UgJiYgdGhpcy5faXNUb29sdGlwVmlzaWJsZSgpKSB7XG4gICAgICB0aGlzLmhpZGUoMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3NldHVwUG9pbnRlckVudGVyRXZlbnRzSWZOZWVkZWQoKTtcbiAgICAgIHRoaXMuX3VwZGF0ZVRvb2x0aXBNZXNzYWdlKCk7XG4gICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAvLyBUaGUgYEFyaWFEZXNjcmliZXJgIGhhcyBzb21lIGZ1bmN0aW9uYWxpdHkgdGhhdCBhdm9pZHMgYWRkaW5nIGEgZGVzY3JpcHRpb24gaWYgaXQncyB0aGVcbiAgICAgICAgLy8gc2FtZSBhcyB0aGUgYGFyaWEtbGFiZWxgIG9mIGFuIGVsZW1lbnQsIGhvd2V2ZXIgd2UgY2FuJ3Qga25vdyB3aGV0aGVyIHRoZSB0b29sdGlwIHRyaWdnZXJcbiAgICAgICAgLy8gaGFzIGEgZGF0YS1ib3VuZCBgYXJpYS1sYWJlbGAgb3Igd2hlbiBpdCdsbCBiZSBzZXQgZm9yIHRoZSBmaXJzdCB0aW1lLiBXZSBjYW4gYXZvaWQgdGhlXG4gICAgICAgIC8vIGlzc3VlIGJ5IGRlZmVycmluZyB0aGUgZGVzY3JpcHRpb24gYnkgYSB0aWNrIHNvIEFuZ3VsYXIgaGFzIHRpbWUgdG8gc2V0IHRoZSBgYXJpYS1sYWJlbGAuXG4gICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX2FyaWFEZXNjcmliZXIuZGVzY3JpYmUodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLm1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9tZXNzYWdlID0gJyc7XG5cbiAgLyoqIENsYXNzZXMgdG8gYmUgcGFzc2VkIHRvIHRoZSB0b29sdGlwLiBTdXBwb3J0cyB0aGUgc2FtZSBzeW50YXggYXMgYG5nQ2xhc3NgLiAqL1xuICBASW5wdXQoJ21hdFRvb2x0aXBDbGFzcycpXG4gIGdldCB0b29sdGlwQ2xhc3MoKSB7IHJldHVybiB0aGlzLl90b29sdGlwQ2xhc3M7IH1cbiAgc2V0IHRvb2x0aXBDbGFzcyh2YWx1ZTogc3RyaW5nfHN0cmluZ1tdfFNldDxzdHJpbmc+fHtba2V5OiBzdHJpbmddOiBhbnl9KSB7XG4gICAgdGhpcy5fdG9vbHRpcENsYXNzID0gdmFsdWU7XG4gICAgaWYgKHRoaXMuX3Rvb2x0aXBJbnN0YW5jZSkge1xuICAgICAgdGhpcy5fc2V0VG9vbHRpcENsYXNzKHRoaXMuX3Rvb2x0aXBDbGFzcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIE1hbnVhbGx5LWJvdW5kIHBhc3NpdmUgZXZlbnQgbGlzdGVuZXJzLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9wYXNzaXZlTGlzdGVuZXJzOlxuICAgICAgKHJlYWRvbmx5IFtzdHJpbmcsIEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3RdKVtdID0gW107XG5cbiAgLyoqIFRpbWVyIHN0YXJ0ZWQgYXQgdGhlIGxhc3QgYHRvdWNoc3RhcnRgIGV2ZW50LiAqL1xuICBwcml2YXRlIF90b3VjaHN0YXJ0VGltZW91dDogbnVtYmVyO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBjb21wb25lbnQgaXMgZGVzdHJveWVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX292ZXJsYXk6IE92ZXJsYXksXG4gICAgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJpdmF0ZSBfc2Nyb2xsRGlzcGF0Y2hlcjogU2Nyb2xsRGlzcGF0Y2hlcixcbiAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxuICAgIHByaXZhdGUgX3BsYXRmb3JtOiBQbGF0Zm9ybSxcbiAgICBwcml2YXRlIF9hcmlhRGVzY3JpYmVyOiBBcmlhRGVzY3JpYmVyLFxuICAgIHByaXZhdGUgX2ZvY3VzTW9uaXRvcjogRm9jdXNNb25pdG9yLFxuICAgIEBJbmplY3QoTUFUX1RPT0xUSVBfU0NST0xMX1NUUkFURUdZKSBzY3JvbGxTdHJhdGVneTogYW55LFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2RpcjogRGlyZWN0aW9uYWxpdHksXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNQVRfVE9PTFRJUF9ERUZBVUxUX09QVElPTlMpXG4gICAgICBwcml2YXRlIF9kZWZhdWx0T3B0aW9uczogTWF0VG9vbHRpcERlZmF1bHRPcHRpb25zKSB7XG5cbiAgICB0aGlzLl9zY3JvbGxTdHJhdGVneSA9IHNjcm9sbFN0cmF0ZWd5O1xuXG4gICAgaWYgKF9kZWZhdWx0T3B0aW9ucykge1xuICAgICAgaWYgKF9kZWZhdWx0T3B0aW9ucy5wb3NpdGlvbikge1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gX2RlZmF1bHRPcHRpb25zLnBvc2l0aW9uO1xuICAgICAgfVxuXG4gICAgICBpZiAoX2RlZmF1bHRPcHRpb25zLnRvdWNoR2VzdHVyZXMpIHtcbiAgICAgICAgdGhpcy50b3VjaEdlc3R1cmVzID0gX2RlZmF1bHRPcHRpb25zLnRvdWNoR2VzdHVyZXM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICBfZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9oYW5kbGVLZXlkb3duKTtcbiAgICB9KTtcbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAvLyBUaGlzIG5lZWRzIHRvIGhhcHBlbiBhZnRlciB2aWV3IGluaXQgc28gdGhlIGluaXRpYWwgdmFsdWVzIGZvciBhbGwgaW5wdXRzIGhhdmUgYmVlbiBzZXQuXG4gICAgdGhpcy5fdmlld0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB0aGlzLl9zZXR1cFBvaW50ZXJFbnRlckV2ZW50c0lmTmVlZGVkKCk7XG5cbiAgICB0aGlzLl9mb2N1c01vbml0b3IubW9uaXRvcih0aGlzLl9lbGVtZW50UmVmKVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpXG4gICAgICAuc3Vic2NyaWJlKG9yaWdpbiA9PiB7XG4gICAgICAgIC8vIE5vdGUgdGhhdCB0aGUgZm9jdXMgbW9uaXRvciBydW5zIG91dHNpZGUgdGhlIEFuZ3VsYXIgem9uZS5cbiAgICAgICAgaWYgKCFvcmlnaW4pIHtcbiAgICAgICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHRoaXMuaGlkZSgwKSk7XG4gICAgICAgIH0gZWxzZSBpZiAob3JpZ2luID09PSAna2V5Ym9hcmQnKSB7XG4gICAgICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB0aGlzLnNob3coKSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlIHRoZSB0b29sdGlwIHdoZW4gZGVzdHJveWVkLlxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgY29uc3QgbmF0aXZlRWxlbWVudCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcblxuICAgIGNsZWFyVGltZW91dCh0aGlzLl90b3VjaHN0YXJ0VGltZW91dCk7XG5cbiAgICBpZiAodGhpcy5fb3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl90b29sdGlwSW5zdGFuY2UgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIENsZWFuIHVwIHRoZSBldmVudCBsaXN0ZW5lcnMgc2V0IGluIHRoZSBjb25zdHJ1Y3RvclxuICAgIG5hdGl2ZUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2hhbmRsZUtleWRvd24pO1xuICAgIHRoaXMuX3Bhc3NpdmVMaXN0ZW5lcnMuZm9yRWFjaCgoW2V2ZW50LCBsaXN0ZW5lcl0pID0+IHtcbiAgICAgIG5hdGl2ZUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIsIHBhc3NpdmVMaXN0ZW5lck9wdGlvbnMpO1xuICAgIH0pO1xuICAgIHRoaXMuX3Bhc3NpdmVMaXN0ZW5lcnMubGVuZ3RoID0gMDtcblxuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG5cbiAgICB0aGlzLl9hcmlhRGVzY3JpYmVyLnJlbW92ZURlc2NyaXB0aW9uKG5hdGl2ZUVsZW1lbnQsIHRoaXMubWVzc2FnZSk7XG4gICAgdGhpcy5fZm9jdXNNb25pdG9yLnN0b3BNb25pdG9yaW5nKG5hdGl2ZUVsZW1lbnQpO1xuICB9XG5cbiAgLyoqIFNob3dzIHRoZSB0b29sdGlwIGFmdGVyIHRoZSBkZWxheSBpbiBtcywgZGVmYXVsdHMgdG8gdG9vbHRpcC1kZWxheS1zaG93IG9yIDBtcyBpZiBubyBpbnB1dCAqL1xuICBzaG93KGRlbGF5OiBudW1iZXIgPSB0aGlzLnNob3dEZWxheSk6IHZvaWQge1xuICAgIGlmICh0aGlzLmRpc2FibGVkIHx8ICF0aGlzLm1lc3NhZ2UgfHwgKHRoaXMuX2lzVG9vbHRpcFZpc2libGUoKSAmJlxuICAgICAgIXRoaXMuX3Rvb2x0aXBJbnN0YW5jZSEuX3Nob3dUaW1lb3V0SWQgJiYgIXRoaXMuX3Rvb2x0aXBJbnN0YW5jZSEuX2hpZGVUaW1lb3V0SWQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBvdmVybGF5UmVmID0gdGhpcy5fY3JlYXRlT3ZlcmxheSgpO1xuICAgIHRoaXMuX2RldGFjaCgpO1xuICAgIHRoaXMuX3BvcnRhbCA9IHRoaXMuX3BvcnRhbCB8fCBuZXcgQ29tcG9uZW50UG9ydGFsKFRvb2x0aXBDb21wb25lbnQsIHRoaXMuX3ZpZXdDb250YWluZXJSZWYpO1xuICAgIHRoaXMuX3Rvb2x0aXBJbnN0YW5jZSA9IG92ZXJsYXlSZWYuYXR0YWNoKHRoaXMuX3BvcnRhbCkuaW5zdGFuY2U7XG4gICAgdGhpcy5fdG9vbHRpcEluc3RhbmNlLmFmdGVySGlkZGVuKClcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9kZXRhY2goKSk7XG4gICAgdGhpcy5fc2V0VG9vbHRpcENsYXNzKHRoaXMuX3Rvb2x0aXBDbGFzcyk7XG4gICAgdGhpcy5fdXBkYXRlVG9vbHRpcE1lc3NhZ2UoKTtcbiAgICB0aGlzLl90b29sdGlwSW5zdGFuY2UhLnNob3coZGVsYXkpO1xuICB9XG5cbiAgLyoqIEhpZGVzIHRoZSB0b29sdGlwIGFmdGVyIHRoZSBkZWxheSBpbiBtcywgZGVmYXVsdHMgdG8gdG9vbHRpcC1kZWxheS1oaWRlIG9yIDBtcyBpZiBubyBpbnB1dCAqL1xuICBoaWRlKGRlbGF5OiBudW1iZXIgPSB0aGlzLmhpZGVEZWxheSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl90b29sdGlwSW5zdGFuY2UpIHtcbiAgICAgIHRoaXMuX3Rvb2x0aXBJbnN0YW5jZS5oaWRlKGRlbGF5KTtcbiAgICB9XG4gIH1cblxuICAvKiogU2hvd3MvaGlkZXMgdGhlIHRvb2x0aXAgKi9cbiAgdG9nZ2xlKCk6IHZvaWQge1xuICAgIHRoaXMuX2lzVG9vbHRpcFZpc2libGUoKSA/IHRoaXMuaGlkZSgpIDogdGhpcy5zaG93KCk7XG4gIH1cblxuICAvKiogUmV0dXJucyB0cnVlIGlmIHRoZSB0b29sdGlwIGlzIGN1cnJlbnRseSB2aXNpYmxlIHRvIHRoZSB1c2VyICovXG4gIF9pc1Rvb2x0aXBWaXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuX3Rvb2x0aXBJbnN0YW5jZSAmJiB0aGlzLl90b29sdGlwSW5zdGFuY2UuaXNWaXNpYmxlKCk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUga2V5ZG93biBldmVudHMgb24gdGhlIGhvc3QgZWxlbWVudC5cbiAgICogTmVlZHMgdG8gYmUgYW4gYXJyb3cgZnVuY3Rpb24gc28gdGhhdCB3ZSBjYW4gdXNlIGl0IGluIGFkZEV2ZW50TGlzdGVuZXIuXG4gICAqL1xuICBwcml2YXRlIF9oYW5kbGVLZXlkb3duID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgaWYgKHRoaXMuX2lzVG9vbHRpcFZpc2libGUoKSAmJiBldmVudC5rZXlDb2RlID09PSBFU0NBUEUgJiYgIWhhc01vZGlmaWVyS2V5KGV2ZW50KSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB0aGlzLmhpZGUoMCkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDcmVhdGUgdGhlIG92ZXJsYXkgY29uZmlnIGFuZCBwb3NpdGlvbiBzdHJhdGVneSAqL1xuICBwcml2YXRlIF9jcmVhdGVPdmVybGF5KCk6IE92ZXJsYXlSZWYge1xuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICByZXR1cm4gdGhpcy5fb3ZlcmxheVJlZjtcbiAgICB9XG5cbiAgICBjb25zdCBzY3JvbGxhYmxlQW5jZXN0b3JzID1cbiAgICAgICAgdGhpcy5fc2Nyb2xsRGlzcGF0Y2hlci5nZXRBbmNlc3RvclNjcm9sbENvbnRhaW5lcnModGhpcy5fZWxlbWVudFJlZik7XG5cbiAgICAvLyBDcmVhdGUgY29ubmVjdGVkIHBvc2l0aW9uIHN0cmF0ZWd5IHRoYXQgbGlzdGVucyBmb3Igc2Nyb2xsIGV2ZW50cyB0byByZXBvc2l0aW9uLlxuICAgIGNvbnN0IHN0cmF0ZWd5ID0gdGhpcy5fb3ZlcmxheS5wb3NpdGlvbigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmZsZXhpYmxlQ29ubmVjdGVkVG8odGhpcy5fZWxlbWVudFJlZilcbiAgICAgICAgICAgICAgICAgICAgICAgICAud2l0aFRyYW5zZm9ybU9yaWdpbk9uKCcubWF0LXRvb2x0aXAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC53aXRoRmxleGlibGVEaW1lbnNpb25zKGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC53aXRoVmlld3BvcnRNYXJnaW4oOClcbiAgICAgICAgICAgICAgICAgICAgICAgICAud2l0aFNjcm9sbGFibGVDb250YWluZXJzKHNjcm9sbGFibGVBbmNlc3RvcnMpO1xuXG4gICAgc3RyYXRlZ3kucG9zaXRpb25DaGFuZ2VzLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpLnN1YnNjcmliZShjaGFuZ2UgPT4ge1xuICAgICAgdGhpcy5fdXBkYXRlQ3VycmVudFBvc2l0aW9uQ2xhc3MoY2hhbmdlLmNvbm5lY3Rpb25QYWlyKTtcblxuICAgICAgaWYgKHRoaXMuX3Rvb2x0aXBJbnN0YW5jZSkge1xuICAgICAgICBpZiAoY2hhbmdlLnNjcm9sbGFibGVWaWV3UHJvcGVydGllcy5pc092ZXJsYXlDbGlwcGVkICYmIHRoaXMuX3Rvb2x0aXBJbnN0YW5jZS5pc1Zpc2libGUoKSkge1xuICAgICAgICAgIC8vIEFmdGVyIHBvc2l0aW9uIGNoYW5nZXMgb2NjdXIgYW5kIHRoZSBvdmVybGF5IGlzIGNsaXBwZWQgYnlcbiAgICAgICAgICAvLyBhIHBhcmVudCBzY3JvbGxhYmxlIHRoZW4gY2xvc2UgdGhlIHRvb2x0aXAuXG4gICAgICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB0aGlzLmhpZGUoMCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9vdmVybGF5UmVmID0gdGhpcy5fb3ZlcmxheS5jcmVhdGUoe1xuICAgICAgZGlyZWN0aW9uOiB0aGlzLl9kaXIsXG4gICAgICBwb3NpdGlvblN0cmF0ZWd5OiBzdHJhdGVneSxcbiAgICAgIHBhbmVsQ2xhc3M6IFRPT0xUSVBfUEFORUxfQ0xBU1MsXG4gICAgICBzY3JvbGxTdHJhdGVneTogdGhpcy5fc2Nyb2xsU3RyYXRlZ3koKVxuICAgIH0pO1xuXG4gICAgdGhpcy5fdXBkYXRlUG9zaXRpb24oKTtcblxuICAgIHRoaXMuX292ZXJsYXlSZWYuZGV0YWNobWVudHMoKVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMuX2RldGFjaCgpKTtcblxuICAgIHJldHVybiB0aGlzLl9vdmVybGF5UmVmO1xuICB9XG5cbiAgLyoqIERldGFjaGVzIHRoZSBjdXJyZW50bHktYXR0YWNoZWQgdG9vbHRpcC4gKi9cbiAgcHJpdmF0ZSBfZGV0YWNoKCkge1xuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmICYmIHRoaXMuX292ZXJsYXlSZWYuaGFzQXR0YWNoZWQoKSkge1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZi5kZXRhY2goKTtcbiAgICB9XG5cbiAgICB0aGlzLl90b29sdGlwSW5zdGFuY2UgPSBudWxsO1xuICB9XG5cbiAgLyoqIFVwZGF0ZXMgdGhlIHBvc2l0aW9uIG9mIHRoZSBjdXJyZW50IHRvb2x0aXAuICovXG4gIHByaXZhdGUgX3VwZGF0ZVBvc2l0aW9uKCkge1xuICAgIGNvbnN0IHBvc2l0aW9uID1cbiAgICAgICAgdGhpcy5fb3ZlcmxheVJlZiEuZ2V0Q29uZmlnKCkucG9zaXRpb25TdHJhdGVneSBhcyBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3k7XG4gICAgY29uc3Qgb3JpZ2luID0gdGhpcy5fZ2V0T3JpZ2luKCk7XG4gICAgY29uc3Qgb3ZlcmxheSA9IHRoaXMuX2dldE92ZXJsYXlQb3NpdGlvbigpO1xuXG4gICAgcG9zaXRpb24ud2l0aFBvc2l0aW9ucyhbXG4gICAgICB7Li4ub3JpZ2luLm1haW4sIC4uLm92ZXJsYXkubWFpbn0sXG4gICAgICB7Li4ub3JpZ2luLmZhbGxiYWNrLCAuLi5vdmVybGF5LmZhbGxiYWNrfVxuICAgIF0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG9yaWdpbiBwb3NpdGlvbiBhbmQgYSBmYWxsYmFjayBwb3NpdGlvbiBiYXNlZCBvbiB0aGUgdXNlcidzIHBvc2l0aW9uIHByZWZlcmVuY2UuXG4gICAqIFRoZSBmYWxsYmFjayBwb3NpdGlvbiBpcyB0aGUgaW52ZXJzZSBvZiB0aGUgb3JpZ2luIChlLmcuIGAnYmVsb3cnIC0+ICdhYm92ZSdgKS5cbiAgICovXG4gIF9nZXRPcmlnaW4oKToge21haW46IE9yaWdpbkNvbm5lY3Rpb25Qb3NpdGlvbiwgZmFsbGJhY2s6IE9yaWdpbkNvbm5lY3Rpb25Qb3NpdGlvbn0ge1xuICAgIGNvbnN0IGlzTHRyID0gIXRoaXMuX2RpciB8fCB0aGlzLl9kaXIudmFsdWUgPT0gJ2x0cic7XG4gICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uO1xuICAgIGxldCBvcmlnaW5Qb3NpdGlvbjogT3JpZ2luQ29ubmVjdGlvblBvc2l0aW9uO1xuXG4gICAgaWYgKHBvc2l0aW9uID09ICdhYm92ZScgfHwgcG9zaXRpb24gPT0gJ2JlbG93Jykge1xuICAgICAgb3JpZ2luUG9zaXRpb24gPSB7b3JpZ2luWDogJ2NlbnRlcicsIG9yaWdpblk6IHBvc2l0aW9uID09ICdhYm92ZScgPyAndG9wJyA6ICdib3R0b20nfTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgcG9zaXRpb24gPT0gJ2JlZm9yZScgfHxcbiAgICAgIChwb3NpdGlvbiA9PSAnbGVmdCcgJiYgaXNMdHIpIHx8XG4gICAgICAocG9zaXRpb24gPT0gJ3JpZ2h0JyAmJiAhaXNMdHIpKSB7XG4gICAgICBvcmlnaW5Qb3NpdGlvbiA9IHtvcmlnaW5YOiAnc3RhcnQnLCBvcmlnaW5ZOiAnY2VudGVyJ307XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHBvc2l0aW9uID09ICdhZnRlcicgfHxcbiAgICAgIChwb3NpdGlvbiA9PSAncmlnaHQnICYmIGlzTHRyKSB8fFxuICAgICAgKHBvc2l0aW9uID09ICdsZWZ0JyAmJiAhaXNMdHIpKSB7XG4gICAgICBvcmlnaW5Qb3NpdGlvbiA9IHtvcmlnaW5YOiAnZW5kJywgb3JpZ2luWTogJ2NlbnRlcid9O1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICB0aHJvdyBnZXRNYXRUb29sdGlwSW52YWxpZFBvc2l0aW9uRXJyb3IocG9zaXRpb24pO1xuICAgIH1cblxuICAgIGNvbnN0IHt4LCB5fSA9IHRoaXMuX2ludmVydFBvc2l0aW9uKG9yaWdpblBvc2l0aW9uIS5vcmlnaW5YLCBvcmlnaW5Qb3NpdGlvbiEub3JpZ2luWSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbWFpbjogb3JpZ2luUG9zaXRpb24hLFxuICAgICAgZmFsbGJhY2s6IHtvcmlnaW5YOiB4LCBvcmlnaW5ZOiB5fVxuICAgIH07XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgb3ZlcmxheSBwb3NpdGlvbiBhbmQgYSBmYWxsYmFjayBwb3NpdGlvbiBiYXNlZCBvbiB0aGUgdXNlcidzIHByZWZlcmVuY2UgKi9cbiAgX2dldE92ZXJsYXlQb3NpdGlvbigpOiB7bWFpbjogT3ZlcmxheUNvbm5lY3Rpb25Qb3NpdGlvbiwgZmFsbGJhY2s6IE92ZXJsYXlDb25uZWN0aW9uUG9zaXRpb259IHtcbiAgICBjb25zdCBpc0x0ciA9ICF0aGlzLl9kaXIgfHwgdGhpcy5fZGlyLnZhbHVlID09ICdsdHInO1xuICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbjtcbiAgICBsZXQgb3ZlcmxheVBvc2l0aW9uOiBPdmVybGF5Q29ubmVjdGlvblBvc2l0aW9uO1xuXG4gICAgaWYgKHBvc2l0aW9uID09ICdhYm92ZScpIHtcbiAgICAgIG92ZXJsYXlQb3NpdGlvbiA9IHtvdmVybGF5WDogJ2NlbnRlcicsIG92ZXJsYXlZOiAnYm90dG9tJ307XG4gICAgfSBlbHNlIGlmIChwb3NpdGlvbiA9PSAnYmVsb3cnKSB7XG4gICAgICBvdmVybGF5UG9zaXRpb24gPSB7b3ZlcmxheVg6ICdjZW50ZXInLCBvdmVybGF5WTogJ3RvcCd9O1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICBwb3NpdGlvbiA9PSAnYmVmb3JlJyB8fFxuICAgICAgKHBvc2l0aW9uID09ICdsZWZ0JyAmJiBpc0x0cikgfHxcbiAgICAgIChwb3NpdGlvbiA9PSAncmlnaHQnICYmICFpc0x0cikpIHtcbiAgICAgIG92ZXJsYXlQb3NpdGlvbiA9IHtvdmVybGF5WDogJ2VuZCcsIG92ZXJsYXlZOiAnY2VudGVyJ307XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHBvc2l0aW9uID09ICdhZnRlcicgfHxcbiAgICAgIChwb3NpdGlvbiA9PSAncmlnaHQnICYmIGlzTHRyKSB8fFxuICAgICAgKHBvc2l0aW9uID09ICdsZWZ0JyAmJiAhaXNMdHIpKSB7XG4gICAgICBvdmVybGF5UG9zaXRpb24gPSB7b3ZlcmxheVg6ICdzdGFydCcsIG92ZXJsYXlZOiAnY2VudGVyJ307XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIHRocm93IGdldE1hdFRvb2x0aXBJbnZhbGlkUG9zaXRpb25FcnJvcihwb3NpdGlvbik7XG4gICAgfVxuXG4gICAgY29uc3Qge3gsIHl9ID0gdGhpcy5faW52ZXJ0UG9zaXRpb24ob3ZlcmxheVBvc2l0aW9uIS5vdmVybGF5WCwgb3ZlcmxheVBvc2l0aW9uIS5vdmVybGF5WSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbWFpbjogb3ZlcmxheVBvc2l0aW9uISxcbiAgICAgIGZhbGxiYWNrOiB7b3ZlcmxheVg6IHgsIG92ZXJsYXlZOiB5fVxuICAgIH07XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUgdG9vbHRpcCBtZXNzYWdlIGFuZCByZXBvc2l0aW9ucyB0aGUgb3ZlcmxheSBhY2NvcmRpbmcgdG8gdGhlIG5ldyBtZXNzYWdlIGxlbmd0aCAqL1xuICBwcml2YXRlIF91cGRhdGVUb29sdGlwTWVzc2FnZSgpIHtcbiAgICAvLyBNdXN0IHdhaXQgZm9yIHRoZSBtZXNzYWdlIHRvIGJlIHBhaW50ZWQgdG8gdGhlIHRvb2x0aXAgc28gdGhhdCB0aGUgb3ZlcmxheSBjYW4gcHJvcGVybHlcbiAgICAvLyBjYWxjdWxhdGUgdGhlIGNvcnJlY3QgcG9zaXRpb25pbmcgYmFzZWQgb24gdGhlIHNpemUgb2YgdGhlIHRleHQuXG4gICAgaWYgKHRoaXMuX3Rvb2x0aXBJbnN0YW5jZSkge1xuICAgICAgdGhpcy5fdG9vbHRpcEluc3RhbmNlLm1lc3NhZ2UgPSB0aGlzLm1lc3NhZ2U7XG4gICAgICB0aGlzLl90b29sdGlwSW5zdGFuY2UuX21hcmtGb3JDaGVjaygpO1xuXG4gICAgICB0aGlzLl9uZ1pvbmUub25NaWNyb3Rhc2tFbXB0eS5waXBlKFxuICAgICAgICB0YWtlKDEpLFxuICAgICAgICB0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKVxuICAgICAgKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fdG9vbHRpcEluc3RhbmNlKSB7XG4gICAgICAgICAgdGhpcy5fb3ZlcmxheVJlZiEudXBkYXRlUG9zaXRpb24oKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFVwZGF0ZXMgdGhlIHRvb2x0aXAgY2xhc3MgKi9cbiAgcHJpdmF0ZSBfc2V0VG9vbHRpcENsYXNzKHRvb2x0aXBDbGFzczogc3RyaW5nfHN0cmluZ1tdfFNldDxzdHJpbmc+fHtba2V5OiBzdHJpbmddOiBhbnl9KSB7XG4gICAgaWYgKHRoaXMuX3Rvb2x0aXBJbnN0YW5jZSkge1xuICAgICAgdGhpcy5fdG9vbHRpcEluc3RhbmNlLnRvb2x0aXBDbGFzcyA9IHRvb2x0aXBDbGFzcztcbiAgICAgIHRoaXMuX3Rvb2x0aXBJbnN0YW5jZS5fbWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEludmVydHMgYW4gb3ZlcmxheSBwb3NpdGlvbi4gKi9cbiAgcHJpdmF0ZSBfaW52ZXJ0UG9zaXRpb24oeDogSG9yaXpvbnRhbENvbm5lY3Rpb25Qb3MsIHk6IFZlcnRpY2FsQ29ubmVjdGlvblBvcykge1xuICAgIGlmICh0aGlzLnBvc2l0aW9uID09PSAnYWJvdmUnIHx8IHRoaXMucG9zaXRpb24gPT09ICdiZWxvdycpIHtcbiAgICAgIGlmICh5ID09PSAndG9wJykge1xuICAgICAgICB5ID0gJ2JvdHRvbSc7XG4gICAgICB9IGVsc2UgaWYgKHkgPT09ICdib3R0b20nKSB7XG4gICAgICAgIHkgPSAndG9wJztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHggPT09ICdlbmQnKSB7XG4gICAgICAgIHggPSAnc3RhcnQnO1xuICAgICAgfSBlbHNlIGlmICh4ID09PSAnc3RhcnQnKSB7XG4gICAgICAgIHggPSAnZW5kJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge3gsIHl9O1xuICB9XG5cbiAgLyoqIFVwZGF0ZXMgdGhlIGNsYXNzIG9uIHRoZSBvdmVybGF5IHBhbmVsIGJhc2VkIG9uIHRoZSBjdXJyZW50IHBvc2l0aW9uIG9mIHRoZSB0b29sdGlwLiAqL1xuICBwcml2YXRlIF91cGRhdGVDdXJyZW50UG9zaXRpb25DbGFzcyhjb25uZWN0aW9uUGFpcjogQ29ubmVjdGlvblBvc2l0aW9uUGFpcik6IHZvaWQge1xuICAgIGNvbnN0IHtvdmVybGF5WSwgb3JpZ2luWCwgb3JpZ2luWX0gPSBjb25uZWN0aW9uUGFpcjtcbiAgICBsZXQgbmV3UG9zaXRpb246IFRvb2x0aXBQb3NpdGlvbjtcblxuICAgIC8vIElmIHRoZSBvdmVybGF5IGlzIGluIHRoZSBtaWRkbGUgYWxvbmcgdGhlIFkgYXhpcyxcbiAgICAvLyBpdCBtZWFucyB0aGF0IGl0J3MgZWl0aGVyIGJlZm9yZSBvciBhZnRlci5cbiAgICBpZiAob3ZlcmxheVkgPT09ICdjZW50ZXInKSB7XG4gICAgICAvLyBOb3RlIHRoYXQgc2luY2UgdGhpcyBpbmZvcm1hdGlvbiBpcyB1c2VkIGZvciBzdHlsaW5nLCB3ZSB3YW50IHRvXG4gICAgICAvLyByZXNvbHZlIGBzdGFydGAgYW5kIGBlbmRgIHRvIHRoZWlyIHJlYWwgdmFsdWVzLCBvdGhlcndpc2UgY29uc3VtZXJzXG4gICAgICAvLyB3b3VsZCBoYXZlIHRvIHJlbWVtYmVyIHRvIGRvIGl0IHRoZW1zZWx2ZXMgb24gZWFjaCBjb25zdW1wdGlvbi5cbiAgICAgIGlmICh0aGlzLl9kaXIgJiYgdGhpcy5fZGlyLnZhbHVlID09PSAncnRsJykge1xuICAgICAgICBuZXdQb3NpdGlvbiA9IG9yaWdpblggPT09ICdlbmQnID8gJ2xlZnQnIDogJ3JpZ2h0JztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1Bvc2l0aW9uID0gb3JpZ2luWCA9PT0gJ3N0YXJ0JyA/ICdsZWZ0JyA6ICdyaWdodCc7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld1Bvc2l0aW9uID0gb3ZlcmxheVkgPT09ICdib3R0b20nICYmIG9yaWdpblkgPT09ICd0b3AnID8gJ2Fib3ZlJyA6ICdiZWxvdyc7XG4gICAgfVxuXG4gICAgaWYgKG5ld1Bvc2l0aW9uICE9PSB0aGlzLl9jdXJyZW50UG9zaXRpb24pIHtcbiAgICAgIGNvbnN0IG92ZXJsYXlSZWYgPSB0aGlzLl9vdmVybGF5UmVmO1xuXG4gICAgICBpZiAob3ZlcmxheVJlZikge1xuICAgICAgICBjb25zdCBjbGFzc1ByZWZpeCA9ICdtYXQtdG9vbHRpcC1wYW5lbC0nO1xuICAgICAgICBvdmVybGF5UmVmLnJlbW92ZVBhbmVsQ2xhc3MoY2xhc3NQcmVmaXggKyB0aGlzLl9jdXJyZW50UG9zaXRpb24pO1xuICAgICAgICBvdmVybGF5UmVmLmFkZFBhbmVsQ2xhc3MoY2xhc3NQcmVmaXggKyBuZXdQb3NpdGlvbik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2N1cnJlbnRQb3NpdGlvbiA9IG5ld1Bvc2l0aW9uO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBCaW5kcyB0aGUgcG9pbnRlciBldmVudHMgdG8gdGhlIHRvb2x0aXAgdHJpZ2dlci4gKi9cbiAgcHJpdmF0ZSBfc2V0dXBQb2ludGVyRW50ZXJFdmVudHNJZk5lZWRlZCgpIHtcbiAgICAvLyBPcHRpbWl6YXRpb246IERlZmVyIGhvb2tpbmcgdXAgZXZlbnRzIGlmIHRoZXJlJ3Mgbm8gbWVzc2FnZSBvciB0aGUgdG9vbHRpcCBpcyBkaXNhYmxlZC5cbiAgICBpZiAodGhpcy5fZGlzYWJsZWQgfHwgIXRoaXMubWVzc2FnZSB8fCAhdGhpcy5fdmlld0luaXRpYWxpemVkIHx8XG4gICAgICAgIHRoaXMuX3Bhc3NpdmVMaXN0ZW5lcnMubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVGhlIG1vdXNlIGV2ZW50cyBzaG91bGRuJ3QgYmUgYm91bmQgb24gbW9iaWxlIGRldmljZXMsIGJlY2F1c2UgdGhleSBjYW4gcHJldmVudCB0aGVcbiAgICAvLyBmaXJzdCB0YXAgZnJvbSBmaXJpbmcgaXRzIGNsaWNrIGV2ZW50IG9yIGNhbiBjYXVzZSB0aGUgdG9vbHRpcCB0byBvcGVuIGZvciBjbGlja3MuXG4gICAgaWYgKHRoaXMuX3BsYXRmb3JtU3VwcG9ydHNNb3VzZUV2ZW50cygpKSB7XG4gICAgICB0aGlzLl9wYXNzaXZlTGlzdGVuZXJzXG4gICAgICAgICAgLnB1c2goWydtb3VzZWVudGVyJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fc2V0dXBQb2ludGVyRXhpdEV2ZW50c0lmTmVlZGVkKCk7XG4gICAgICAgICAgICB0aGlzLnNob3coKTtcbiAgICAgICAgICB9XSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnRvdWNoR2VzdHVyZXMgIT09ICdvZmYnKSB7XG4gICAgICB0aGlzLl9kaXNhYmxlTmF0aXZlR2VzdHVyZXNJZk5lY2Vzc2FyeSgpO1xuXG4gICAgICB0aGlzLl9wYXNzaXZlTGlzdGVuZXJzXG4gICAgICAgICAgLnB1c2goWyd0b3VjaHN0YXJ0JywgKCkgPT4ge1xuICAgICAgICAgICAgLy8gTm90ZSB0aGF0IGl0J3MgaW1wb3J0YW50IHRoYXQgd2UgZG9uJ3QgYHByZXZlbnREZWZhdWx0YCBoZXJlLFxuICAgICAgICAgICAgLy8gYmVjYXVzZSBpdCBjYW4gcHJldmVudCBjbGljayBldmVudHMgZnJvbSBmaXJpbmcgb24gdGhlIGVsZW1lbnQuXG4gICAgICAgICAgICB0aGlzLl9zZXR1cFBvaW50ZXJFeGl0RXZlbnRzSWZOZWVkZWQoKTtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90b3VjaHN0YXJ0VGltZW91dCk7XG4gICAgICAgICAgICB0aGlzLl90b3VjaHN0YXJ0VGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5zaG93KCksIExPTkdQUkVTU19ERUxBWSk7XG4gICAgICAgICAgfV0pO1xuICAgIH1cblxuICAgIHRoaXMuX2FkZExpc3RlbmVycyh0aGlzLl9wYXNzaXZlTGlzdGVuZXJzKTtcbiAgfVxuXG4gIHByaXZhdGUgX3NldHVwUG9pbnRlckV4aXRFdmVudHNJZk5lZWRlZCgpIHtcbiAgICBpZiAodGhpcy5fcG9pbnRlckV4aXRFdmVudHNJbml0aWFsaXplZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9wb2ludGVyRXhpdEV2ZW50c0luaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgIGNvbnN0IGV4aXRMaXN0ZW5lcnM6IChyZWFkb25seSBbc3RyaW5nLCBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0XSlbXSA9IFtdO1xuICAgIGlmICh0aGlzLl9wbGF0Zm9ybVN1cHBvcnRzTW91c2VFdmVudHMoKSkge1xuICAgICAgZXhpdExpc3RlbmVycy5wdXNoKFsnbW91c2VsZWF2ZScsICgpID0+IHRoaXMuaGlkZSgpXSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnRvdWNoR2VzdHVyZXMgIT09ICdvZmYnKSB7XG4gICAgICB0aGlzLl9kaXNhYmxlTmF0aXZlR2VzdHVyZXNJZk5lY2Vzc2FyeSgpO1xuICAgICAgY29uc3QgdG91Y2hlbmRMaXN0ZW5lciA9ICgpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RvdWNoc3RhcnRUaW1lb3V0KTtcbiAgICAgICAgdGhpcy5oaWRlKHRoaXMuX2RlZmF1bHRPcHRpb25zLnRvdWNoZW5kSGlkZURlbGF5KTtcbiAgICAgIH07XG5cbiAgICAgIGV4aXRMaXN0ZW5lcnMucHVzaChcbiAgICAgICAgWyd0b3VjaGVuZCcsIHRvdWNoZW5kTGlzdGVuZXJdLFxuICAgICAgICBbJ3RvdWNoY2FuY2VsJywgdG91Y2hlbmRMaXN0ZW5lcl0sXG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMuX2FkZExpc3RlbmVycyhleGl0TGlzdGVuZXJzKTtcbiAgICB0aGlzLl9wYXNzaXZlTGlzdGVuZXJzLnB1c2goLi4uZXhpdExpc3RlbmVycyk7XG4gIH1cblxuICBwcml2YXRlIF9hZGRMaXN0ZW5lcnMoXG4gICAgICBsaXN0ZW5lcnM6IFJlYWRvbmx5QXJyYXk8cmVhZG9ubHkgW3N0cmluZywgRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdF0+KSB7XG4gICAgbGlzdGVuZXJzLmZvckVhY2goKFtldmVudCwgbGlzdGVuZXJdKSA9PiB7XG4gICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIsIHBhc3NpdmVMaXN0ZW5lck9wdGlvbnMpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGxhdGZvcm1TdXBwb3J0c01vdXNlRXZlbnRzKCkge1xuICAgIHJldHVybiAhdGhpcy5fcGxhdGZvcm0uSU9TICYmICF0aGlzLl9wbGF0Zm9ybS5BTkRST0lEO1xuICB9XG5cbiAgLyoqIERpc2FibGVzIHRoZSBuYXRpdmUgYnJvd3NlciBnZXN0dXJlcywgYmFzZWQgb24gaG93IHRoZSB0b29sdGlwIGhhcyBiZWVuIGNvbmZpZ3VyZWQuICovXG4gIHByaXZhdGUgX2Rpc2FibGVOYXRpdmVHZXN0dXJlc0lmTmVjZXNzYXJ5KCkge1xuICAgIGNvbnN0IGdlc3R1cmVzID0gdGhpcy50b3VjaEdlc3R1cmVzO1xuXG4gICAgaWYgKGdlc3R1cmVzICE9PSAnb2ZmJykge1xuICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICAgIGNvbnN0IHN0eWxlID0gZWxlbWVudC5zdHlsZTtcblxuICAgICAgLy8gSWYgZ2VzdHVyZXMgYXJlIHNldCB0byBgYXV0b2AsIHdlIGRvbid0IGRpc2FibGUgdGV4dCBzZWxlY3Rpb24gb24gaW5wdXRzIGFuZFxuICAgICAgLy8gdGV4dGFyZWFzLCBiZWNhdXNlIGl0IHByZXZlbnRzIHRoZSB1c2VyIGZyb20gdHlwaW5nIGludG8gdGhlbSBvbiBpT1MgU2FmYXJpLlxuICAgICAgaWYgKGdlc3R1cmVzID09PSAnb24nIHx8IChlbGVtZW50Lm5vZGVOYW1lICE9PSAnSU5QVVQnICYmIGVsZW1lbnQubm9kZU5hbWUgIT09ICdURVhUQVJFQScpKSB7XG4gICAgICAgIHN0eWxlLnVzZXJTZWxlY3QgPSAoc3R5bGUgYXMgYW55KS5tc1VzZXJTZWxlY3QgPSBzdHlsZS53ZWJraXRVc2VyU2VsZWN0ID1cbiAgICAgICAgICAgIChzdHlsZSBhcyBhbnkpLk1velVzZXJTZWxlY3QgPSAnbm9uZSc7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHdlIGhhdmUgYGF1dG9gIGdlc3R1cmVzIGFuZCB0aGUgZWxlbWVudCB1c2VzIG5hdGl2ZSBIVE1MIGRyYWdnaW5nLFxuICAgICAgLy8gd2UgZG9uJ3Qgc2V0IGAtd2Via2l0LXVzZXItZHJhZ2AgYmVjYXVzZSBpdCBwcmV2ZW50cyB0aGUgbmF0aXZlIGJlaGF2aW9yLlxuICAgICAgaWYgKGdlc3R1cmVzID09PSAnb24nIHx8ICFlbGVtZW50LmRyYWdnYWJsZSkge1xuICAgICAgICAoc3R5bGUgYXMgYW55KS53ZWJraXRVc2VyRHJhZyA9ICdub25lJztcbiAgICAgIH1cblxuICAgICAgc3R5bGUudG91Y2hBY3Rpb24gPSAnbm9uZSc7XG4gICAgICBzdHlsZS53ZWJraXRUYXBIaWdobGlnaHRDb2xvciA9ICd0cmFuc3BhcmVudCc7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Rpc2FibGVkOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9oaWRlRGVsYXk6IE51bWJlcklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2hvd0RlbGF5OiBOdW1iZXJJbnB1dDtcbn1cblxuLyoqXG4gKiBJbnRlcm5hbCBjb21wb25lbnQgdGhhdCB3cmFwcyB0aGUgdG9vbHRpcCdzIGNvbnRlbnQuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ21hdC10b29sdGlwLWNvbXBvbmVudCcsXG4gIHRlbXBsYXRlVXJsOiAndG9vbHRpcC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJ3Rvb2x0aXAuY3NzJ10sXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBhbmltYXRpb25zOiBbbWF0VG9vbHRpcEFuaW1hdGlvbnMudG9vbHRpcFN0YXRlXSxcbiAgaG9zdDoge1xuICAgIC8vIEZvcmNlcyB0aGUgZWxlbWVudCB0byBoYXZlIGEgbGF5b3V0IGluIElFIGFuZCBFZGdlLiBUaGlzIGZpeGVzIGlzc3VlcyB3aGVyZSB0aGUgZWxlbWVudFxuICAgIC8vIHdvbid0IGJlIHJlbmRlcmVkIGlmIHRoZSBhbmltYXRpb25zIGFyZSBkaXNhYmxlZCBvciB0aGVyZSBpcyBubyB3ZWIgYW5pbWF0aW9ucyBwb2x5ZmlsbC5cbiAgICAnW3N0eWxlLnpvb21dJzogJ192aXNpYmlsaXR5ID09PSBcInZpc2libGVcIiA/IDEgOiBudWxsJyxcbiAgICAnKGJvZHk6Y2xpY2spJzogJ3RoaXMuX2hhbmRsZUJvZHlJbnRlcmFjdGlvbigpJyxcbiAgICAnYXJpYS1oaWRkZW4nOiAndHJ1ZScsXG4gIH1cbn0pXG5leHBvcnQgY2xhc3MgVG9vbHRpcENvbXBvbmVudCBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8qKiBNZXNzYWdlIHRvIGRpc3BsYXkgaW4gdGhlIHRvb2x0aXAgKi9cbiAgbWVzc2FnZTogc3RyaW5nO1xuXG4gIC8qKiBDbGFzc2VzIHRvIGJlIGFkZGVkIHRvIHRoZSB0b29sdGlwLiBTdXBwb3J0cyB0aGUgc2FtZSBzeW50YXggYXMgYG5nQ2xhc3NgLiAqL1xuICB0b29sdGlwQ2xhc3M6IHN0cmluZ3xzdHJpbmdbXXxTZXQ8c3RyaW5nPnx7W2tleTogc3RyaW5nXTogYW55fTtcblxuICAvKiogVGhlIHRpbWVvdXQgSUQgb2YgYW55IGN1cnJlbnQgdGltZXIgc2V0IHRvIHNob3cgdGhlIHRvb2x0aXAgKi9cbiAgX3Nob3dUaW1lb3V0SWQ6IG51bWJlciB8IG51bGw7XG5cbiAgLyoqIFRoZSB0aW1lb3V0IElEIG9mIGFueSBjdXJyZW50IHRpbWVyIHNldCB0byBoaWRlIHRoZSB0b29sdGlwICovXG4gIF9oaWRlVGltZW91dElkOiBudW1iZXIgfCBudWxsO1xuXG4gIC8qKiBQcm9wZXJ0eSB3YXRjaGVkIGJ5IHRoZSBhbmltYXRpb24gZnJhbWV3b3JrIHRvIHNob3cgb3IgaGlkZSB0aGUgdG9vbHRpcCAqL1xuICBfdmlzaWJpbGl0eTogVG9vbHRpcFZpc2liaWxpdHkgPSAnaW5pdGlhbCc7XG5cbiAgLyoqIFdoZXRoZXIgaW50ZXJhY3Rpb25zIG9uIHRoZSBwYWdlIHNob3VsZCBjbG9zZSB0aGUgdG9vbHRpcCAqL1xuICBwcml2YXRlIF9jbG9zZU9uSW50ZXJhY3Rpb246IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogU3ViamVjdCBmb3Igbm90aWZ5aW5nIHRoYXQgdGhlIHRvb2x0aXAgaGFzIGJlZW4gaGlkZGVuIGZyb20gdGhlIHZpZXcgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfb25IaWRlOiBTdWJqZWN0PHZvaWQ+ID0gbmV3IFN1YmplY3QoKTtcblxuICAvKiogU3RyZWFtIHRoYXQgZW1pdHMgd2hldGhlciB0aGUgdXNlciBoYXMgYSBoYW5kc2V0LXNpemVkIGRpc3BsYXkuICAqL1xuICBfaXNIYW5kc2V0OiBPYnNlcnZhYmxlPEJyZWFrcG9pbnRTdGF0ZT4gPSB0aGlzLl9icmVha3BvaW50T2JzZXJ2ZXIub2JzZXJ2ZShCcmVha3BvaW50cy5IYW5kc2V0KTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHJpdmF0ZSBfYnJlYWtwb2ludE9ic2VydmVyOiBCcmVha3BvaW50T2JzZXJ2ZXIpIHt9XG5cbiAgLyoqXG4gICAqIFNob3dzIHRoZSB0b29sdGlwIHdpdGggYW4gYW5pbWF0aW9uIG9yaWdpbmF0aW5nIGZyb20gdGhlIHByb3ZpZGVkIG9yaWdpblxuICAgKiBAcGFyYW0gZGVsYXkgQW1vdW50IG9mIG1pbGxpc2Vjb25kcyB0byB0aGUgZGVsYXkgc2hvd2luZyB0aGUgdG9vbHRpcC5cbiAgICovXG4gIHNob3coZGVsYXk6IG51bWJlcik6IHZvaWQge1xuICAgIC8vIENhbmNlbCB0aGUgZGVsYXllZCBoaWRlIGlmIGl0IGlzIHNjaGVkdWxlZFxuICAgIGlmICh0aGlzLl9oaWRlVGltZW91dElkKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5faGlkZVRpbWVvdXRJZCk7XG4gICAgICB0aGlzLl9oaWRlVGltZW91dElkID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBCb2R5IGludGVyYWN0aW9ucyBzaG91bGQgY2FuY2VsIHRoZSB0b29sdGlwIGlmIHRoZXJlIGlzIGEgZGVsYXkgaW4gc2hvd2luZy5cbiAgICB0aGlzLl9jbG9zZU9uSW50ZXJhY3Rpb24gPSB0cnVlO1xuICAgIHRoaXMuX3Nob3dUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX3Zpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgICB0aGlzLl9zaG93VGltZW91dElkID0gbnVsbDtcblxuICAgICAgLy8gTWFyayBmb3IgY2hlY2sgc28gaWYgYW55IHBhcmVudCBjb21wb25lbnQgaGFzIHNldCB0aGVcbiAgICAgIC8vIENoYW5nZURldGVjdGlvblN0cmF0ZWd5IHRvIE9uUHVzaCBpdCB3aWxsIGJlIGNoZWNrZWQgYW55d2F5c1xuICAgICAgdGhpcy5fbWFya0ZvckNoZWNrKCk7XG4gICAgfSwgZGVsYXkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJlZ2lucyB0aGUgYW5pbWF0aW9uIHRvIGhpZGUgdGhlIHRvb2x0aXAgYWZ0ZXIgdGhlIHByb3ZpZGVkIGRlbGF5IGluIG1zLlxuICAgKiBAcGFyYW0gZGVsYXkgQW1vdW50IG9mIG1pbGxpc2Vjb25kcyB0byBkZWxheSBzaG93aW5nIHRoZSB0b29sdGlwLlxuICAgKi9cbiAgaGlkZShkZWxheTogbnVtYmVyKTogdm9pZCB7XG4gICAgLy8gQ2FuY2VsIHRoZSBkZWxheWVkIHNob3cgaWYgaXQgaXMgc2NoZWR1bGVkXG4gICAgaWYgKHRoaXMuX3Nob3dUaW1lb3V0SWQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9zaG93VGltZW91dElkKTtcbiAgICAgIHRoaXMuX3Nob3dUaW1lb3V0SWQgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX2hpZGVUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX3Zpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICAgIHRoaXMuX2hpZGVUaW1lb3V0SWQgPSBudWxsO1xuXG4gICAgICAvLyBNYXJrIGZvciBjaGVjayBzbyBpZiBhbnkgcGFyZW50IGNvbXBvbmVudCBoYXMgc2V0IHRoZVxuICAgICAgLy8gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kgdG8gT25QdXNoIGl0IHdpbGwgYmUgY2hlY2tlZCBhbnl3YXlzXG4gICAgICB0aGlzLl9tYXJrRm9yQ2hlY2soKTtcbiAgICB9LCBkZWxheSk7XG4gIH1cblxuICAvKiogUmV0dXJucyBhbiBvYnNlcnZhYmxlIHRoYXQgbm90aWZpZXMgd2hlbiB0aGUgdG9vbHRpcCBoYXMgYmVlbiBoaWRkZW4gZnJvbSB2aWV3LiAqL1xuICBhZnRlckhpZGRlbigpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fb25IaWRlO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHRvb2x0aXAgaXMgYmVpbmcgZGlzcGxheWVkLiAqL1xuICBpc1Zpc2libGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3Zpc2liaWxpdHkgPT09ICd2aXNpYmxlJztcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX29uSGlkZS5jb21wbGV0ZSgpO1xuICB9XG5cbiAgX2FuaW1hdGlvblN0YXJ0KCkge1xuICAgIHRoaXMuX2Nsb3NlT25JbnRlcmFjdGlvbiA9IGZhbHNlO1xuICB9XG5cbiAgX2FuaW1hdGlvbkRvbmUoZXZlbnQ6IEFuaW1hdGlvbkV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgdG9TdGF0ZSA9IGV2ZW50LnRvU3RhdGUgYXMgVG9vbHRpcFZpc2liaWxpdHk7XG5cbiAgICBpZiAodG9TdGF0ZSA9PT0gJ2hpZGRlbicgJiYgIXRoaXMuaXNWaXNpYmxlKCkpIHtcbiAgICAgIHRoaXMuX29uSGlkZS5uZXh0KCk7XG4gICAgfVxuXG4gICAgaWYgKHRvU3RhdGUgPT09ICd2aXNpYmxlJyB8fCB0b1N0YXRlID09PSAnaGlkZGVuJykge1xuICAgICAgdGhpcy5fY2xvc2VPbkludGVyYWN0aW9uID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSW50ZXJhY3Rpb25zIG9uIHRoZSBIVE1MIGJvZHkgc2hvdWxkIGNsb3NlIHRoZSB0b29sdGlwIGltbWVkaWF0ZWx5IGFzIGRlZmluZWQgaW4gdGhlXG4gICAqIG1hdGVyaWFsIGRlc2lnbiBzcGVjLlxuICAgKiBodHRwczovL21hdGVyaWFsLmlvL2Rlc2lnbi9jb21wb25lbnRzL3Rvb2x0aXBzLmh0bWwjYmVoYXZpb3JcbiAgICovXG4gIF9oYW5kbGVCb2R5SW50ZXJhY3Rpb24oKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2Nsb3NlT25JbnRlcmFjdGlvbikge1xuICAgICAgdGhpcy5oaWRlKDApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrcyB0aGF0IHRoZSB0b29sdGlwIG5lZWRzIHRvIGJlIGNoZWNrZWQgaW4gdGhlIG5leHQgY2hhbmdlIGRldGVjdGlvbiBydW4uXG4gICAqIE1haW5seSB1c2VkIGZvciByZW5kZXJpbmcgdGhlIGluaXRpYWwgdGV4dCBiZWZvcmUgcG9zaXRpb25pbmcgYSB0b29sdGlwLCB3aGljaFxuICAgKiBjYW4gYmUgcHJvYmxlbWF0aWMgaW4gY29tcG9uZW50cyB3aXRoIE9uUHVzaCBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgKi9cbiAgX21hcmtGb3JDaGVjaygpOiB2b2lkIHtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxufVxuIl19