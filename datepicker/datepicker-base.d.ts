/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { BooleanInput } from '@angular/cdk/coercion';
import { Overlay, ScrollStrategy } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import { AfterViewInit, ElementRef, EventEmitter, InjectionToken, NgZone, OnDestroy, ViewContainerRef, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CanColor, CanColorCtor, DateAdapter, ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Observable } from 'rxjs';
import { MatCalendar, MatCalendarView } from './calendar';
import { MatCalendarUserEvent, MatCalendarCellClassFunction } from './calendar-body';
import { DateFilterFn } from './datepicker-input-base';
import { ExtractDateTypeFromSelection, MatDateSelectionModel, DateRange } from './date-selection-model';
import { MatDateRangeSelectionStrategy } from './date-range-selection-strategy';
import { MatDatepickerIntl } from './datepicker-intl';
/** Injection token that determines the scroll handling while the calendar is open. */
export declare const MAT_DATEPICKER_SCROLL_STRATEGY: InjectionToken<() => ScrollStrategy>;
/** @docs-private */
export declare function MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy;
/** Possible positions for the datepicker dropdown along the X axis. */
export declare type DatepickerDropdownPositionX = 'start' | 'end';
/** Possible positions for the datepicker dropdown along the Y axis. */
export declare type DatepickerDropdownPositionY = 'above' | 'below';
/** @docs-private */
export declare const MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER: {
    provide: InjectionToken<() => ScrollStrategy>;
    deps: (typeof Overlay)[];
    useFactory: typeof MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY;
};
/** @docs-private */
declare class MatDatepickerContentBase {
    _elementRef: ElementRef;
    constructor(_elementRef: ElementRef);
}
declare const _MatDatepickerContentMixinBase: CanColorCtor & typeof MatDatepickerContentBase;
/**
 * Component used as the content for the datepicker dialog and popup. We use this instead of using
 * MatCalendar directly as the content so we can control the initial focus. This also gives us a
 * place to put additional features of the popup that are not part of the calendar itself in the
 * future. (e.g. confirmation buttons).
 * @docs-private
 */
export declare class MatDatepickerContent<S, D = ExtractDateTypeFromSelection<S>> extends _MatDatepickerContentMixinBase implements AfterViewInit, OnDestroy, CanColor {
    private _changeDetectorRef;
    private _model;
    private _dateAdapter;
    private _rangeSelectionStrategy;
    private _subscriptions;
    /** Reference to the internal calendar component. */
    _calendar: MatCalendar<D>;
    /** Reference to the datepicker that created the overlay. */
    datepicker: MatDatepickerBase<any, S, D>;
    /** Start of the comparison range. */
    comparisonStart: D | null;
    /** End of the comparison range. */
    comparisonEnd: D | null;
    /** Whether the datepicker is above or below the input. */
    _isAbove: boolean;
    /** Current state of the animation. */
    _animationState: 'enter' | 'void';
    /** Emits when an animation has finished. */
    _animationDone: Subject<void>;
    /** Text for the close button. */
    _closeButtonText: string;
    /** Whether the close button currently has focus. */
    _closeButtonFocused: boolean;
    constructor(elementRef: ElementRef, _changeDetectorRef: ChangeDetectorRef, _model: MatDateSelectionModel<S, D>, _dateAdapter: DateAdapter<D>, _rangeSelectionStrategy: MatDateRangeSelectionStrategy<D>, 
    /**
     * @deprecated `intl` argument to become required.
     * @breaking-change 12.0.0
     */
    intl?: MatDatepickerIntl);
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    _handleUserSelection(event: MatCalendarUserEvent<D | null>): void;
    _startExitAnimation(): void;
    _getSelected(): D | DateRange<D> | null;
}
/** Form control that can be associated with a datepicker. */
export interface MatDatepickerControl<D> {
    getStartValue(): D | null;
    getThemePalette(): ThemePalette;
    min: D | null;
    max: D | null;
    disabled: boolean;
    dateFilter: DateFilterFn<D>;
    getConnectedOverlayOrigin(): ElementRef;
    stateChanges: Observable<void>;
}
/** Base class for a datepicker. */
export declare abstract class MatDatepickerBase<C extends MatDatepickerControl<D>, S, D = ExtractDateTypeFromSelection<S>> implements OnDestroy, OnChanges {
    private _dialog;
    private _overlay;
    private _ngZone;
    private _viewContainerRef;
    private _dateAdapter;
    private _dir;
    private _document;
    private _model;
    private _scrollStrategy;
    private _inputStateChanges;
    /** An input indicating the type of the custom header component for the calendar, if set. */
    calendarHeaderComponent: ComponentType<any>;
    /** The date to open the calendar to initially. */
    get startAt(): D | null;
    set startAt(value: D | null);
    private _startAt;
    /** The view that the calendar should start in. */
    startView: 'month' | 'year' | 'multi-year';
    /** Color palette to use on the datepicker's calendar. */
    get color(): ThemePalette;
    set color(value: ThemePalette);
    _color: ThemePalette;
    /**
     * Whether the calendar UI is in touch mode. In touch mode the calendar opens in a dialog rather
     * than a popup and elements have more padding to allow for bigger touch targets.
     */
    get touchUi(): boolean;
    set touchUi(value: boolean);
    private _touchUi;
    /** Whether the datepicker pop-up should be disabled. */
    get disabled(): boolean;
    set disabled(value: boolean);
    private _disabled;
    /** Preferred position of the datepicker in the X axis. */
    xPosition: DatepickerDropdownPositionX;
    /** Preferred position of the datepicker in the Y axis. */
    yPosition: DatepickerDropdownPositionY;
    /**
     * Emits selected year in multiyear view.
     * This doesn't imply a change on the selected date.
     */
    readonly yearSelected: EventEmitter<D>;
    /**
     * Emits selected month in year view.
     * This doesn't imply a change on the selected date.
     */
    readonly monthSelected: EventEmitter<D>;
    /**
     * Emits when the current view changes.
     */
    readonly viewChanged: EventEmitter<MatCalendarView>;
    /** Function that can be used to add custom CSS classes to dates. */
    dateClass: MatCalendarCellClassFunction<D>;
    /** Emits when the datepicker has been opened. */
    openedStream: EventEmitter<void>;
    /** Emits when the datepicker has been closed. */
    closedStream: EventEmitter<void>;
    /**
     * Classes to be passed to the date picker panel.
     * Supports string and string array values, similar to `ngClass`.
     */
    get panelClass(): string | string[];
    set panelClass(value: string | string[]);
    private _panelClass;
    /** Whether the calendar is open. */
    get opened(): boolean;
    set opened(value: boolean);
    private _opened;
    /** The id for the datepicker calendar. */
    id: string;
    /** The minimum selectable date. */
    _getMinDate(): D | null;
    /** The maximum selectable date. */
    _getMaxDate(): D | null;
    _getDateFilter(): DateFilterFn<D>;
    /** A reference to the overlay when the calendar is opened as a popup. */
    private _popupRef;
    /** A reference to the dialog when the calendar is opened as a dialog. */
    private _dialogRef;
    /** Reference to the component instantiated in popup mode. */
    private _popupComponentRef;
    /** The element that was focused before the datepicker was opened. */
    private _focusedElementBeforeOpen;
    /** Unique class that will be added to the backdrop so that the test harnesses can look it up. */
    private _backdropHarnessClass;
    /** The input element this datepicker is associated with. */
    _datepickerInput: C;
    /** Emits when the datepicker's state changes. */
    readonly _stateChanges: Subject<void>;
    constructor(_dialog: MatDialog, _overlay: Overlay, _ngZone: NgZone, _viewContainerRef: ViewContainerRef, scrollStrategy: any, _dateAdapter: DateAdapter<D>, _dir: Directionality, _document: any, _model: MatDateSelectionModel<S, D>);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    /** Selects the given date */
    select(date: D): void;
    /** Emits the selected year in multiyear view */
    _selectYear(normalizedYear: D): void;
    /** Emits selected month in year view */
    _selectMonth(normalizedMonth: D): void;
    /** Emits changed view */
    _viewChanged(view: MatCalendarView): void;
    /**
     * Register an input with this datepicker.
     * @param input The datepicker input to register with this datepicker.
     * @returns Selection model that the input should hook itself up to.
     */
    _registerInput(input: C): MatDateSelectionModel<S, D>;
    /** Open the calendar. */
    open(): void;
    /** Close the calendar. */
    close(): void;
    /** Open the calendar as a dialog. */
    private _openAsDialog;
    /** Open the calendar as a popup. */
    private _openAsPopup;
    /** Forwards relevant values from the datepicker to the datepicker content inside the overlay. */
    protected _forwardContentValues(instance: MatDatepickerContent<S, D>): void;
    /** Create the popup. */
    private _createPopup;
    /** Destroys the current popup overlay. */
    private _destroyPopup;
    /** Sets the positions of the datepicker in dropdown mode based on the current configuration. */
    private _setConnectedPositions;
    static ngAcceptInputType_disabled: BooleanInput;
    static ngAcceptInputType_opened: BooleanInput;
    static ngAcceptInputType_touchUi: BooleanInput;
}
export {};
