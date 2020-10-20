/**
 * @fileoverview added by tsickle
 * Generated from: src/material/core/datetime/date-adapter.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { inject, InjectionToken, LOCALE_ID } from '@angular/core';
import { Subject } from 'rxjs';
/**
 * InjectionToken for datepicker that can be used to override default locale code.
 * @type {?}
 */
export const MAT_DATE_LOCALE = new InjectionToken('MAT_DATE_LOCALE', {
    providedIn: 'root',
    factory: MAT_DATE_LOCALE_FACTORY,
});
/**
 * \@docs-private
 * @return {?}
 */
export function MAT_DATE_LOCALE_FACTORY() {
    return inject(LOCALE_ID);
}
/**
 * No longer needed since MAT_DATE_LOCALE has been changed to a scoped injectable.
 * If you are importing and providing this in your code you can simply remove it.
 * @deprecated
 * \@breaking-change 8.0.0
 * @type {?}
 */
export const MAT_DATE_LOCALE_PROVIDER = { provide: MAT_DATE_LOCALE, useExisting: LOCALE_ID };
/**
 * Adapts type `D` to be usable as a date by cdk-based components that work with dates.
 * @abstract
 * @template D
 */
export class DateAdapter {
    constructor() {
        this._localeChanges = new Subject();
    }
    /**
     * A stream that emits when the locale changes.
     * @return {?}
     */
    get localeChanges() { return this._localeChanges; }
    /**
     * Attempts to deserialize a value to a valid date object. This is different from parsing in that
     * deserialize should only accept non-ambiguous, locale-independent formats (e.g. a ISO 8601
     * string). The default implementation does not allow any deserialization, it simply checks that
     * the given value is already a valid date object or null. The `<mat-datepicker>` will call this
     * method on all of its `\@Input()` properties that accept dates. It is therefore possible to
     * support passing values from your backend directly to these properties by overriding this method
     * to also deserialize the format used by your backend.
     * @param {?} value The value to be deserialized into a date object.
     * @return {?} The deserialized date object, either a valid date, null if the value can be
     *     deserialized into a null date (e.g. the empty string), or an invalid date.
     */
    deserialize(value) {
        if (value == null || this.isDateInstance(value) && this.isValid(value)) {
            return value;
        }
        return this.invalid();
    }
    /**
     * Sets the locale used for all dates.
     * @param {?} locale The new locale.
     * @return {?}
     */
    setLocale(locale) {
        this.locale = locale;
        this._localeChanges.next();
    }
    /**
     * Compares two dates.
     * @param {?} first The first date to compare.
     * @param {?} second The second date to compare.
     * @return {?} 0 if the dates are equal, a number less than 0 if the first date is earlier,
     *     a number greater than 0 if the first date is later.
     */
    compareDate(first, second) {
        return this.getYear(first) - this.getYear(second) ||
            this.getMonth(first) - this.getMonth(second) ||
            this.getDate(first) - this.getDate(second);
    }
    /**
     * Checks if two dates are equal.
     * @param {?} first The first date to check.
     * @param {?} second The second date to check.
     * @return {?} Whether the two dates are equal.
     *     Null dates are considered equal to other null dates.
     */
    sameDate(first, second) {
        if (first && second) {
            /** @type {?} */
            let firstValid = this.isValid(first);
            /** @type {?} */
            let secondValid = this.isValid(second);
            if (firstValid && secondValid) {
                return !this.compareDate(first, second);
            }
            return firstValid == secondValid;
        }
        return first == second;
    }
    /**
     * Clamp the given date between min and max dates.
     * @param {?} date The date to clamp.
     * @param {?=} min The minimum value to allow. If null or omitted no min is enforced.
     * @param {?=} max The maximum value to allow. If null or omitted no max is enforced.
     * @return {?} `min` if `date` is less than `min`, `max` if date is greater than `max`,
     *     otherwise `date`.
     */
    clampDate(date, min, max) {
        if (min && this.compareDate(date, min) < 0) {
            return min;
        }
        if (max && this.compareDate(date, max) > 0) {
            return max;
        }
        return date;
    }
}
if (false) {
    /**
     * The locale to use for all dates.
     * @type {?}
     * @protected
     */
    DateAdapter.prototype.locale;
    /**
     * @type {?}
     * @protected
     */
    DateAdapter.prototype._localeChanges;
    /**
     * Gets the year component of the given date.
     * @abstract
     * @param {?} date The date to extract the year from.
     * @return {?} The year component.
     */
    DateAdapter.prototype.getYear = function (date) { };
    /**
     * Gets the month component of the given date.
     * @abstract
     * @param {?} date The date to extract the month from.
     * @return {?} The month component (0-indexed, 0 = January).
     */
    DateAdapter.prototype.getMonth = function (date) { };
    /**
     * Gets the date of the month component of the given date.
     * @abstract
     * @param {?} date The date to extract the date of the month from.
     * @return {?} The month component (1-indexed, 1 = first of month).
     */
    DateAdapter.prototype.getDate = function (date) { };
    /**
     * Gets the day of the week component of the given date.
     * @abstract
     * @param {?} date The date to extract the day of the week from.
     * @return {?} The month component (0-indexed, 0 = Sunday).
     */
    DateAdapter.prototype.getDayOfWeek = function (date) { };
    /**
     * Gets a list of names for the months.
     * @abstract
     * @param {?} style The naming style (e.g. long = 'January', short = 'Jan', narrow = 'J').
     * @return {?} An ordered list of all month names, starting with January.
     */
    DateAdapter.prototype.getMonthNames = function (style) { };
    /**
     * Gets a list of names for the dates of the month.
     * @abstract
     * @return {?} An ordered list of all date of the month names, starting with '1'.
     */
    DateAdapter.prototype.getDateNames = function () { };
    /**
     * Gets a list of names for the days of the week.
     * @abstract
     * @param {?} style The naming style (e.g. long = 'Sunday', short = 'Sun', narrow = 'S').
     * @return {?} An ordered list of all weekday names, starting with Sunday.
     */
    DateAdapter.prototype.getDayOfWeekNames = function (style) { };
    /**
     * Gets the name for the year of the given date.
     * @abstract
     * @param {?} date The date to get the year name for.
     * @return {?} The name of the given year (e.g. '2017').
     */
    DateAdapter.prototype.getYearName = function (date) { };
    /**
     * Gets the first day of the week.
     * @abstract
     * @return {?} The first day of the week (0-indexed, 0 = Sunday).
     */
    DateAdapter.prototype.getFirstDayOfWeek = function () { };
    /**
     * Gets the number of days in the month of the given date.
     * @abstract
     * @param {?} date The date whose month should be checked.
     * @return {?} The number of days in the month of the given date.
     */
    DateAdapter.prototype.getNumDaysInMonth = function (date) { };
    /**
     * Clones the given date.
     * @abstract
     * @param {?} date The date to clone
     * @return {?} A new date equal to the given date.
     */
    DateAdapter.prototype.clone = function (date) { };
    /**
     * Creates a date with the given year, month, and date. Does not allow over/under-flow of the
     * month and date.
     * @abstract
     * @param {?} year The full year of the date. (e.g. 89 means the year 89, not the year 1989).
     * @param {?} month The month of the date (0-indexed, 0 = January). Must be an integer 0 - 11.
     * @param {?} date The date of month of the date. Must be an integer 1 - length of the given month.
     * @return {?} The new date, or null if invalid.
     */
    DateAdapter.prototype.createDate = function (year, month, date) { };
    /**
     * Gets today's date.
     * @abstract
     * @return {?} Today's date.
     */
    DateAdapter.prototype.today = function () { };
    /**
     * Parses a date from a user-provided value.
     * @abstract
     * @param {?} value The value to parse.
     * @param {?} parseFormat The expected format of the value being parsed
     *     (type is implementation-dependent).
     * @return {?} The parsed date.
     */
    DateAdapter.prototype.parse = function (value, parseFormat) { };
    /**
     * Formats a date as a string according to the given format.
     * @abstract
     * @param {?} date The value to format.
     * @param {?} displayFormat The format to use to display the date as a string.
     * @return {?} The formatted date string.
     */
    DateAdapter.prototype.format = function (date, displayFormat) { };
    /**
     * Adds the given number of years to the date. Years are counted as if flipping 12 pages on the
     * calendar for each year and then finding the closest date in the new month. For example when
     * adding 1 year to Feb 29, 2016, the resulting date will be Feb 28, 2017.
     * @abstract
     * @param {?} date The date to add years to.
     * @param {?} years The number of years to add (may be negative).
     * @return {?} A new date equal to the given one with the specified number of years added.
     */
    DateAdapter.prototype.addCalendarYears = function (date, years) { };
    /**
     * Adds the given number of months to the date. Months are counted as if flipping a page on the
     * calendar for each month and then finding the closest date in the new month. For example when
     * adding 1 month to Jan 31, 2017, the resulting date will be Feb 28, 2017.
     * @abstract
     * @param {?} date The date to add months to.
     * @param {?} months The number of months to add (may be negative).
     * @return {?} A new date equal to the given one with the specified number of months added.
     */
    DateAdapter.prototype.addCalendarMonths = function (date, months) { };
    /**
     * Adds the given number of days to the date. Days are counted as if moving one cell on the
     * calendar for each day.
     * @abstract
     * @param {?} date The date to add days to.
     * @param {?} days The number of days to add (may be negative).
     * @return {?} A new date equal to the given one with the specified number of days added.
     */
    DateAdapter.prototype.addCalendarDays = function (date, days) { };
    /**
     * Gets the RFC 3339 compatible string (https://tools.ietf.org/html/rfc3339) for the given date.
     * This method is used to generate date strings that are compatible with native HTML attributes
     * such as the `min` or `max` attribute of an `<input>`.
     * @abstract
     * @param {?} date The date to get the ISO date string for.
     * @return {?} The ISO date string date string.
     */
    DateAdapter.prototype.toIso8601 = function (date) { };
    /**
     * Checks whether the given object is considered a date instance by this DateAdapter.
     * @abstract
     * @param {?} obj The object to check
     * @return {?} Whether the object is a date instance.
     */
    DateAdapter.prototype.isDateInstance = function (obj) { };
    /**
     * Checks whether the given date is valid.
     * @abstract
     * @param {?} date The date to check.
     * @return {?} Whether the date is valid.
     */
    DateAdapter.prototype.isValid = function (date) { };
    /**
     * Gets date instance that is not valid.
     * @abstract
     * @return {?} An invalid date.
     */
    DateAdapter.prototype.invalid = function () { };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2NvcmUvZGF0ZXRpbWUvZGF0ZS1hZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNoRSxPQUFPLEVBQWEsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDOzs7OztBQUd6QyxNQUFNLE9BQU8sZUFBZSxHQUFHLElBQUksY0FBYyxDQUFTLGlCQUFpQixFQUFFO0lBQzNFLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLE9BQU8sRUFBRSx1QkFBdUI7Q0FDakMsQ0FBQzs7Ozs7QUFHRixNQUFNLFVBQVUsdUJBQXVCO0lBQ3JDLE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzNCLENBQUM7Ozs7Ozs7O0FBUUQsTUFBTSxPQUFPLHdCQUF3QixHQUFHLEVBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFDOzs7Ozs7QUFHMUYsTUFBTSxPQUFnQixXQUFXO0lBQWpDO1FBTVksbUJBQWMsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO0lBcVBqRCxDQUFDOzs7OztJQXRQQyxJQUFJLGFBQWEsS0FBdUIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7OztJQXFMckUsV0FBVyxDQUFDLEtBQVU7UUFDcEIsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN0RSxPQUFPLEtBQUssQ0FBQztTQUNkO1FBQ0QsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDeEIsQ0FBQzs7Ozs7O0lBTUQsU0FBUyxDQUFDLE1BQVc7UUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM3QixDQUFDOzs7Ozs7OztJQVNELFdBQVcsQ0FBQyxLQUFRLEVBQUUsTUFBUztRQUM3QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDN0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUM1QyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakQsQ0FBQzs7Ozs7Ozs7SUFTRCxRQUFRLENBQUMsS0FBZSxFQUFFLE1BQWdCO1FBQ3hDLElBQUksS0FBSyxJQUFJLE1BQU0sRUFBRTs7Z0JBQ2YsVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDOztnQkFDaEMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQ3RDLElBQUksVUFBVSxJQUFJLFdBQVcsRUFBRTtnQkFDN0IsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3pDO1lBQ0QsT0FBTyxVQUFVLElBQUksV0FBVyxDQUFDO1NBQ2xDO1FBQ0QsT0FBTyxLQUFLLElBQUksTUFBTSxDQUFDO0lBQ3pCLENBQUM7Ozs7Ozs7OztJQVVELFNBQVMsQ0FBQyxJQUFPLEVBQUUsR0FBYyxFQUFFLEdBQWM7UUFDL0MsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQzFDLE9BQU8sR0FBRyxDQUFDO1NBQ1o7UUFDRCxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDMUMsT0FBTyxHQUFHLENBQUM7U0FDWjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUNGOzs7Ozs7O0lBelBDLDZCQUFzQjs7Ozs7SUFJdEIscUNBQStDOzs7Ozs7O0lBTy9DLG9EQUFrQzs7Ozs7OztJQU9sQyxxREFBbUM7Ozs7Ozs7SUFPbkMsb0RBQWtDOzs7Ozs7O0lBT2xDLHlEQUF1Qzs7Ozs7OztJQU92QywyREFBcUU7Ozs7OztJQU1yRSxxREFBa0M7Ozs7Ozs7SUFPbEMsK0RBQXlFOzs7Ozs7O0lBT3pFLHdEQUFzQzs7Ozs7O0lBTXRDLDBEQUFxQzs7Ozs7OztJQU9yQyw4REFBNEM7Ozs7Ozs7SUFPNUMsa0RBQTJCOzs7Ozs7Ozs7O0lBVTNCLG9FQUFrRTs7Ozs7O0lBTWxFLDhDQUFvQjs7Ozs7Ozs7O0lBU3BCLGdFQUF1RDs7Ozs7Ozs7SUFRdkQsa0VBQXFEOzs7Ozs7Ozs7O0lBVXJELG9FQUFxRDs7Ozs7Ozs7OztJQVVyRCxzRUFBdUQ7Ozs7Ozs7OztJQVN2RCxrRUFBbUQ7Ozs7Ozs7OztJQVNuRCxzREFBb0M7Ozs7Ozs7SUFPcEMsMERBQTJDOzs7Ozs7O0lBTzNDLG9EQUFtQzs7Ozs7O0lBTW5DLGdEQUFzQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2luamVjdCwgSW5qZWN0aW9uVG9rZW4sIExPQ0FMRV9JRH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuXG4vKiogSW5qZWN0aW9uVG9rZW4gZm9yIGRhdGVwaWNrZXIgdGhhdCBjYW4gYmUgdXNlZCB0byBvdmVycmlkZSBkZWZhdWx0IGxvY2FsZSBjb2RlLiAqL1xuZXhwb3J0IGNvbnN0IE1BVF9EQVRFX0xPQ0FMRSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxzdHJpbmc+KCdNQVRfREFURV9MT0NBTEUnLCB7XG4gIHByb3ZpZGVkSW46ICdyb290JyxcbiAgZmFjdG9yeTogTUFUX0RBVEVfTE9DQUxFX0ZBQ1RPUlksXG59KTtcblxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmV4cG9ydCBmdW5jdGlvbiBNQVRfREFURV9MT0NBTEVfRkFDVE9SWSgpOiBzdHJpbmcge1xuICByZXR1cm4gaW5qZWN0KExPQ0FMRV9JRCk7XG59XG5cbi8qKlxuICogTm8gbG9uZ2VyIG5lZWRlZCBzaW5jZSBNQVRfREFURV9MT0NBTEUgaGFzIGJlZW4gY2hhbmdlZCB0byBhIHNjb3BlZCBpbmplY3RhYmxlLlxuICogSWYgeW91IGFyZSBpbXBvcnRpbmcgYW5kIHByb3ZpZGluZyB0aGlzIGluIHlvdXIgY29kZSB5b3UgY2FuIHNpbXBseSByZW1vdmUgaXQuXG4gKiBAZGVwcmVjYXRlZFxuICogQGJyZWFraW5nLWNoYW5nZSA4LjAuMFxuICovXG5leHBvcnQgY29uc3QgTUFUX0RBVEVfTE9DQUxFX1BST1ZJREVSID0ge3Byb3ZpZGU6IE1BVF9EQVRFX0xPQ0FMRSwgdXNlRXhpc3Rpbmc6IExPQ0FMRV9JRH07XG5cbi8qKiBBZGFwdHMgdHlwZSBgRGAgdG8gYmUgdXNhYmxlIGFzIGEgZGF0ZSBieSBjZGstYmFzZWQgY29tcG9uZW50cyB0aGF0IHdvcmsgd2l0aCBkYXRlcy4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBEYXRlQWRhcHRlcjxEPiB7XG4gIC8qKiBUaGUgbG9jYWxlIHRvIHVzZSBmb3IgYWxsIGRhdGVzLiAqL1xuICBwcm90ZWN0ZWQgbG9jYWxlOiBhbnk7XG5cbiAgLyoqIEEgc3RyZWFtIHRoYXQgZW1pdHMgd2hlbiB0aGUgbG9jYWxlIGNoYW5nZXMuICovXG4gIGdldCBsb2NhbGVDaGFuZ2VzKCk6IE9ic2VydmFibGU8dm9pZD4geyByZXR1cm4gdGhpcy5fbG9jYWxlQ2hhbmdlczsgfVxuICBwcm90ZWN0ZWQgX2xvY2FsZUNoYW5nZXMgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSB5ZWFyIGNvbXBvbmVudCBvZiB0aGUgZ2l2ZW4gZGF0ZS5cbiAgICogQHBhcmFtIGRhdGUgVGhlIGRhdGUgdG8gZXh0cmFjdCB0aGUgeWVhciBmcm9tLlxuICAgKiBAcmV0dXJucyBUaGUgeWVhciBjb21wb25lbnQuXG4gICAqL1xuICBhYnN0cmFjdCBnZXRZZWFyKGRhdGU6IEQpOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG1vbnRoIGNvbXBvbmVudCBvZiB0aGUgZ2l2ZW4gZGF0ZS5cbiAgICogQHBhcmFtIGRhdGUgVGhlIGRhdGUgdG8gZXh0cmFjdCB0aGUgbW9udGggZnJvbS5cbiAgICogQHJldHVybnMgVGhlIG1vbnRoIGNvbXBvbmVudCAoMC1pbmRleGVkLCAwID0gSmFudWFyeSkuXG4gICAqL1xuICBhYnN0cmFjdCBnZXRNb250aChkYXRlOiBEKTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBkYXRlIG9mIHRoZSBtb250aCBjb21wb25lbnQgb2YgdGhlIGdpdmVuIGRhdGUuXG4gICAqIEBwYXJhbSBkYXRlIFRoZSBkYXRlIHRvIGV4dHJhY3QgdGhlIGRhdGUgb2YgdGhlIG1vbnRoIGZyb20uXG4gICAqIEByZXR1cm5zIFRoZSBtb250aCBjb21wb25lbnQgKDEtaW5kZXhlZCwgMSA9IGZpcnN0IG9mIG1vbnRoKS5cbiAgICovXG4gIGFic3RyYWN0IGdldERhdGUoZGF0ZTogRCk6IG51bWJlcjtcblxuICAvKipcbiAgICogR2V0cyB0aGUgZGF5IG9mIHRoZSB3ZWVrIGNvbXBvbmVudCBvZiB0aGUgZ2l2ZW4gZGF0ZS5cbiAgICogQHBhcmFtIGRhdGUgVGhlIGRhdGUgdG8gZXh0cmFjdCB0aGUgZGF5IG9mIHRoZSB3ZWVrIGZyb20uXG4gICAqIEByZXR1cm5zIFRoZSBtb250aCBjb21wb25lbnQgKDAtaW5kZXhlZCwgMCA9IFN1bmRheSkuXG4gICAqL1xuICBhYnN0cmFjdCBnZXREYXlPZldlZWsoZGF0ZTogRCk6IG51bWJlcjtcblxuICAvKipcbiAgICogR2V0cyBhIGxpc3Qgb2YgbmFtZXMgZm9yIHRoZSBtb250aHMuXG4gICAqIEBwYXJhbSBzdHlsZSBUaGUgbmFtaW5nIHN0eWxlIChlLmcuIGxvbmcgPSAnSmFudWFyeScsIHNob3J0ID0gJ0phbicsIG5hcnJvdyA9ICdKJykuXG4gICAqIEByZXR1cm5zIEFuIG9yZGVyZWQgbGlzdCBvZiBhbGwgbW9udGggbmFtZXMsIHN0YXJ0aW5nIHdpdGggSmFudWFyeS5cbiAgICovXG4gIGFic3RyYWN0IGdldE1vbnRoTmFtZXMoc3R5bGU6ICdsb25nJyB8ICdzaG9ydCcgfCAnbmFycm93Jyk6IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgbGlzdCBvZiBuYW1lcyBmb3IgdGhlIGRhdGVzIG9mIHRoZSBtb250aC5cbiAgICogQHJldHVybnMgQW4gb3JkZXJlZCBsaXN0IG9mIGFsbCBkYXRlIG9mIHRoZSBtb250aCBuYW1lcywgc3RhcnRpbmcgd2l0aCAnMScuXG4gICAqL1xuICBhYnN0cmFjdCBnZXREYXRlTmFtZXMoKTogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIEdldHMgYSBsaXN0IG9mIG5hbWVzIGZvciB0aGUgZGF5cyBvZiB0aGUgd2Vlay5cbiAgICogQHBhcmFtIHN0eWxlIFRoZSBuYW1pbmcgc3R5bGUgKGUuZy4gbG9uZyA9ICdTdW5kYXknLCBzaG9ydCA9ICdTdW4nLCBuYXJyb3cgPSAnUycpLlxuICAgKiBAcmV0dXJucyBBbiBvcmRlcmVkIGxpc3Qgb2YgYWxsIHdlZWtkYXkgbmFtZXMsIHN0YXJ0aW5nIHdpdGggU3VuZGF5LlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0RGF5T2ZXZWVrTmFtZXMoc3R5bGU6ICdsb25nJyB8ICdzaG9ydCcgfCAnbmFycm93Jyk6IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBuYW1lIGZvciB0aGUgeWVhciBvZiB0aGUgZ2l2ZW4gZGF0ZS5cbiAgICogQHBhcmFtIGRhdGUgVGhlIGRhdGUgdG8gZ2V0IHRoZSB5ZWFyIG5hbWUgZm9yLlxuICAgKiBAcmV0dXJucyBUaGUgbmFtZSBvZiB0aGUgZ2l2ZW4geWVhciAoZS5nLiAnMjAxNycpLlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0WWVhck5hbWUoZGF0ZTogRCk6IHN0cmluZztcblxuICAvKipcbiAgICogR2V0cyB0aGUgZmlyc3QgZGF5IG9mIHRoZSB3ZWVrLlxuICAgKiBAcmV0dXJucyBUaGUgZmlyc3QgZGF5IG9mIHRoZSB3ZWVrICgwLWluZGV4ZWQsIDAgPSBTdW5kYXkpLlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0Rmlyc3REYXlPZldlZWsoKTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBudW1iZXIgb2YgZGF5cyBpbiB0aGUgbW9udGggb2YgdGhlIGdpdmVuIGRhdGUuXG4gICAqIEBwYXJhbSBkYXRlIFRoZSBkYXRlIHdob3NlIG1vbnRoIHNob3VsZCBiZSBjaGVja2VkLlxuICAgKiBAcmV0dXJucyBUaGUgbnVtYmVyIG9mIGRheXMgaW4gdGhlIG1vbnRoIG9mIHRoZSBnaXZlbiBkYXRlLlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0TnVtRGF5c0luTW9udGgoZGF0ZTogRCk6IG51bWJlcjtcblxuICAvKipcbiAgICogQ2xvbmVzIHRoZSBnaXZlbiBkYXRlLlxuICAgKiBAcGFyYW0gZGF0ZSBUaGUgZGF0ZSB0byBjbG9uZVxuICAgKiBAcmV0dXJucyBBIG5ldyBkYXRlIGVxdWFsIHRvIHRoZSBnaXZlbiBkYXRlLlxuICAgKi9cbiAgYWJzdHJhY3QgY2xvbmUoZGF0ZTogRCk6IEQ7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBkYXRlIHdpdGggdGhlIGdpdmVuIHllYXIsIG1vbnRoLCBhbmQgZGF0ZS4gRG9lcyBub3QgYWxsb3cgb3Zlci91bmRlci1mbG93IG9mIHRoZVxuICAgKiBtb250aCBhbmQgZGF0ZS5cbiAgICogQHBhcmFtIHllYXIgVGhlIGZ1bGwgeWVhciBvZiB0aGUgZGF0ZS4gKGUuZy4gODkgbWVhbnMgdGhlIHllYXIgODksIG5vdCB0aGUgeWVhciAxOTg5KS5cbiAgICogQHBhcmFtIG1vbnRoIFRoZSBtb250aCBvZiB0aGUgZGF0ZSAoMC1pbmRleGVkLCAwID0gSmFudWFyeSkuIE11c3QgYmUgYW4gaW50ZWdlciAwIC0gMTEuXG4gICAqIEBwYXJhbSBkYXRlIFRoZSBkYXRlIG9mIG1vbnRoIG9mIHRoZSBkYXRlLiBNdXN0IGJlIGFuIGludGVnZXIgMSAtIGxlbmd0aCBvZiB0aGUgZ2l2ZW4gbW9udGguXG4gICAqIEByZXR1cm5zIFRoZSBuZXcgZGF0ZSwgb3IgbnVsbCBpZiBpbnZhbGlkLlxuICAgKi9cbiAgYWJzdHJhY3QgY3JlYXRlRGF0ZSh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRhdGU6IG51bWJlcik6IEQ7XG5cbiAgLyoqXG4gICAqIEdldHMgdG9kYXkncyBkYXRlLlxuICAgKiBAcmV0dXJucyBUb2RheSdzIGRhdGUuXG4gICAqL1xuICBhYnN0cmFjdCB0b2RheSgpOiBEO1xuXG4gIC8qKlxuICAgKiBQYXJzZXMgYSBkYXRlIGZyb20gYSB1c2VyLXByb3ZpZGVkIHZhbHVlLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHBhcnNlLlxuICAgKiBAcGFyYW0gcGFyc2VGb3JtYXQgVGhlIGV4cGVjdGVkIGZvcm1hdCBvZiB0aGUgdmFsdWUgYmVpbmcgcGFyc2VkXG4gICAqICAgICAodHlwZSBpcyBpbXBsZW1lbnRhdGlvbi1kZXBlbmRlbnQpLlxuICAgKiBAcmV0dXJucyBUaGUgcGFyc2VkIGRhdGUuXG4gICAqL1xuICBhYnN0cmFjdCBwYXJzZSh2YWx1ZTogYW55LCBwYXJzZUZvcm1hdDogYW55KTogRCB8IG51bGw7XG5cbiAgLyoqXG4gICAqIEZvcm1hdHMgYSBkYXRlIGFzIGEgc3RyaW5nIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gZm9ybWF0LlxuICAgKiBAcGFyYW0gZGF0ZSBUaGUgdmFsdWUgdG8gZm9ybWF0LlxuICAgKiBAcGFyYW0gZGlzcGxheUZvcm1hdCBUaGUgZm9ybWF0IHRvIHVzZSB0byBkaXNwbGF5IHRoZSBkYXRlIGFzIGEgc3RyaW5nLlxuICAgKiBAcmV0dXJucyBUaGUgZm9ybWF0dGVkIGRhdGUgc3RyaW5nLlxuICAgKi9cbiAgYWJzdHJhY3QgZm9ybWF0KGRhdGU6IEQsIGRpc3BsYXlGb3JtYXQ6IGFueSk6IHN0cmluZztcblxuICAvKipcbiAgICogQWRkcyB0aGUgZ2l2ZW4gbnVtYmVyIG9mIHllYXJzIHRvIHRoZSBkYXRlLiBZZWFycyBhcmUgY291bnRlZCBhcyBpZiBmbGlwcGluZyAxMiBwYWdlcyBvbiB0aGVcbiAgICogY2FsZW5kYXIgZm9yIGVhY2ggeWVhciBhbmQgdGhlbiBmaW5kaW5nIHRoZSBjbG9zZXN0IGRhdGUgaW4gdGhlIG5ldyBtb250aC4gRm9yIGV4YW1wbGUgd2hlblxuICAgKiBhZGRpbmcgMSB5ZWFyIHRvIEZlYiAyOSwgMjAxNiwgdGhlIHJlc3VsdGluZyBkYXRlIHdpbGwgYmUgRmViIDI4LCAyMDE3LlxuICAgKiBAcGFyYW0gZGF0ZSBUaGUgZGF0ZSB0byBhZGQgeWVhcnMgdG8uXG4gICAqIEBwYXJhbSB5ZWFycyBUaGUgbnVtYmVyIG9mIHllYXJzIHRvIGFkZCAobWF5IGJlIG5lZ2F0aXZlKS5cbiAgICogQHJldHVybnMgQSBuZXcgZGF0ZSBlcXVhbCB0byB0aGUgZ2l2ZW4gb25lIHdpdGggdGhlIHNwZWNpZmllZCBudW1iZXIgb2YgeWVhcnMgYWRkZWQuXG4gICAqL1xuICBhYnN0cmFjdCBhZGRDYWxlbmRhclllYXJzKGRhdGU6IEQsIHllYXJzOiBudW1iZXIpOiBEO1xuXG4gIC8qKlxuICAgKiBBZGRzIHRoZSBnaXZlbiBudW1iZXIgb2YgbW9udGhzIHRvIHRoZSBkYXRlLiBNb250aHMgYXJlIGNvdW50ZWQgYXMgaWYgZmxpcHBpbmcgYSBwYWdlIG9uIHRoZVxuICAgKiBjYWxlbmRhciBmb3IgZWFjaCBtb250aCBhbmQgdGhlbiBmaW5kaW5nIHRoZSBjbG9zZXN0IGRhdGUgaW4gdGhlIG5ldyBtb250aC4gRm9yIGV4YW1wbGUgd2hlblxuICAgKiBhZGRpbmcgMSBtb250aCB0byBKYW4gMzEsIDIwMTcsIHRoZSByZXN1bHRpbmcgZGF0ZSB3aWxsIGJlIEZlYiAyOCwgMjAxNy5cbiAgICogQHBhcmFtIGRhdGUgVGhlIGRhdGUgdG8gYWRkIG1vbnRocyB0by5cbiAgICogQHBhcmFtIG1vbnRocyBUaGUgbnVtYmVyIG9mIG1vbnRocyB0byBhZGQgKG1heSBiZSBuZWdhdGl2ZSkuXG4gICAqIEByZXR1cm5zIEEgbmV3IGRhdGUgZXF1YWwgdG8gdGhlIGdpdmVuIG9uZSB3aXRoIHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIG1vbnRocyBhZGRlZC5cbiAgICovXG4gIGFic3RyYWN0IGFkZENhbGVuZGFyTW9udGhzKGRhdGU6IEQsIG1vbnRoczogbnVtYmVyKTogRDtcblxuICAvKipcbiAgICogQWRkcyB0aGUgZ2l2ZW4gbnVtYmVyIG9mIGRheXMgdG8gdGhlIGRhdGUuIERheXMgYXJlIGNvdW50ZWQgYXMgaWYgbW92aW5nIG9uZSBjZWxsIG9uIHRoZVxuICAgKiBjYWxlbmRhciBmb3IgZWFjaCBkYXkuXG4gICAqIEBwYXJhbSBkYXRlIFRoZSBkYXRlIHRvIGFkZCBkYXlzIHRvLlxuICAgKiBAcGFyYW0gZGF5cyBUaGUgbnVtYmVyIG9mIGRheXMgdG8gYWRkIChtYXkgYmUgbmVnYXRpdmUpLlxuICAgKiBAcmV0dXJucyBBIG5ldyBkYXRlIGVxdWFsIHRvIHRoZSBnaXZlbiBvbmUgd2l0aCB0aGUgc3BlY2lmaWVkIG51bWJlciBvZiBkYXlzIGFkZGVkLlxuICAgKi9cbiAgYWJzdHJhY3QgYWRkQ2FsZW5kYXJEYXlzKGRhdGU6IEQsIGRheXM6IG51bWJlcik6IEQ7XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIFJGQyAzMzM5IGNvbXBhdGlibGUgc3RyaW5nIChodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzMzOSkgZm9yIHRoZSBnaXZlbiBkYXRlLlxuICAgKiBUaGlzIG1ldGhvZCBpcyB1c2VkIHRvIGdlbmVyYXRlIGRhdGUgc3RyaW5ncyB0aGF0IGFyZSBjb21wYXRpYmxlIHdpdGggbmF0aXZlIEhUTUwgYXR0cmlidXRlc1xuICAgKiBzdWNoIGFzIHRoZSBgbWluYCBvciBgbWF4YCBhdHRyaWJ1dGUgb2YgYW4gYDxpbnB1dD5gLlxuICAgKiBAcGFyYW0gZGF0ZSBUaGUgZGF0ZSB0byBnZXQgdGhlIElTTyBkYXRlIHN0cmluZyBmb3IuXG4gICAqIEByZXR1cm5zIFRoZSBJU08gZGF0ZSBzdHJpbmcgZGF0ZSBzdHJpbmcuXG4gICAqL1xuICBhYnN0cmFjdCB0b0lzbzg2MDEoZGF0ZTogRCk6IHN0cmluZztcblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBjb25zaWRlcmVkIGEgZGF0ZSBpbnN0YW5jZSBieSB0aGlzIERhdGVBZGFwdGVyLlxuICAgKiBAcGFyYW0gb2JqIFRoZSBvYmplY3QgdG8gY2hlY2tcbiAgICogQHJldHVybnMgV2hldGhlciB0aGUgb2JqZWN0IGlzIGEgZGF0ZSBpbnN0YW5jZS5cbiAgICovXG4gIGFic3RyYWN0IGlzRGF0ZUluc3RhbmNlKG9iajogYW55KTogYm9vbGVhbjtcblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIGRhdGUgaXMgdmFsaWQuXG4gICAqIEBwYXJhbSBkYXRlIFRoZSBkYXRlIHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBkYXRlIGlzIHZhbGlkLlxuICAgKi9cbiAgYWJzdHJhY3QgaXNWYWxpZChkYXRlOiBEKTogYm9vbGVhbjtcblxuICAvKipcbiAgICogR2V0cyBkYXRlIGluc3RhbmNlIHRoYXQgaXMgbm90IHZhbGlkLlxuICAgKiBAcmV0dXJucyBBbiBpbnZhbGlkIGRhdGUuXG4gICAqL1xuICBhYnN0cmFjdCBpbnZhbGlkKCk6IEQ7XG5cbiAgLyoqXG4gICAqIEF0dGVtcHRzIHRvIGRlc2VyaWFsaXplIGEgdmFsdWUgdG8gYSB2YWxpZCBkYXRlIG9iamVjdC4gVGhpcyBpcyBkaWZmZXJlbnQgZnJvbSBwYXJzaW5nIGluIHRoYXRcbiAgICogZGVzZXJpYWxpemUgc2hvdWxkIG9ubHkgYWNjZXB0IG5vbi1hbWJpZ3VvdXMsIGxvY2FsZS1pbmRlcGVuZGVudCBmb3JtYXRzIChlLmcuIGEgSVNPIDg2MDFcbiAgICogc3RyaW5nKS4gVGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gZG9lcyBub3QgYWxsb3cgYW55IGRlc2VyaWFsaXphdGlvbiwgaXQgc2ltcGx5IGNoZWNrcyB0aGF0XG4gICAqIHRoZSBnaXZlbiB2YWx1ZSBpcyBhbHJlYWR5IGEgdmFsaWQgZGF0ZSBvYmplY3Qgb3IgbnVsbC4gVGhlIGA8bWF0LWRhdGVwaWNrZXI+YCB3aWxsIGNhbGwgdGhpc1xuICAgKiBtZXRob2Qgb24gYWxsIG9mIGl0cyBgQElucHV0KClgIHByb3BlcnRpZXMgdGhhdCBhY2NlcHQgZGF0ZXMuIEl0IGlzIHRoZXJlZm9yZSBwb3NzaWJsZSB0b1xuICAgKiBzdXBwb3J0IHBhc3NpbmcgdmFsdWVzIGZyb20geW91ciBiYWNrZW5kIGRpcmVjdGx5IHRvIHRoZXNlIHByb3BlcnRpZXMgYnkgb3ZlcnJpZGluZyB0aGlzIG1ldGhvZFxuICAgKiB0byBhbHNvIGRlc2VyaWFsaXplIHRoZSBmb3JtYXQgdXNlZCBieSB5b3VyIGJhY2tlbmQuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gYmUgZGVzZXJpYWxpemVkIGludG8gYSBkYXRlIG9iamVjdC5cbiAgICogQHJldHVybnMgVGhlIGRlc2VyaWFsaXplZCBkYXRlIG9iamVjdCwgZWl0aGVyIGEgdmFsaWQgZGF0ZSwgbnVsbCBpZiB0aGUgdmFsdWUgY2FuIGJlXG4gICAqICAgICBkZXNlcmlhbGl6ZWQgaW50byBhIG51bGwgZGF0ZSAoZS5nLiB0aGUgZW1wdHkgc3RyaW5nKSwgb3IgYW4gaW52YWxpZCBkYXRlLlxuICAgKi9cbiAgZGVzZXJpYWxpemUodmFsdWU6IGFueSk6IEQgfCBudWxsIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCB8fCB0aGlzLmlzRGF0ZUluc3RhbmNlKHZhbHVlKSAmJiB0aGlzLmlzVmFsaWQodmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmludmFsaWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBsb2NhbGUgdXNlZCBmb3IgYWxsIGRhdGVzLlxuICAgKiBAcGFyYW0gbG9jYWxlIFRoZSBuZXcgbG9jYWxlLlxuICAgKi9cbiAgc2V0TG9jYWxlKGxvY2FsZTogYW55KSB7XG4gICAgdGhpcy5sb2NhbGUgPSBsb2NhbGU7XG4gICAgdGhpcy5fbG9jYWxlQ2hhbmdlcy5uZXh0KCk7XG4gIH1cblxuICAvKipcbiAgICogQ29tcGFyZXMgdHdvIGRhdGVzLlxuICAgKiBAcGFyYW0gZmlyc3QgVGhlIGZpcnN0IGRhdGUgdG8gY29tcGFyZS5cbiAgICogQHBhcmFtIHNlY29uZCBUaGUgc2Vjb25kIGRhdGUgdG8gY29tcGFyZS5cbiAgICogQHJldHVybnMgMCBpZiB0aGUgZGF0ZXMgYXJlIGVxdWFsLCBhIG51bWJlciBsZXNzIHRoYW4gMCBpZiB0aGUgZmlyc3QgZGF0ZSBpcyBlYXJsaWVyLFxuICAgKiAgICAgYSBudW1iZXIgZ3JlYXRlciB0aGFuIDAgaWYgdGhlIGZpcnN0IGRhdGUgaXMgbGF0ZXIuXG4gICAqL1xuICBjb21wYXJlRGF0ZShmaXJzdDogRCwgc2Vjb25kOiBEKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRZZWFyKGZpcnN0KSAtIHRoaXMuZ2V0WWVhcihzZWNvbmQpIHx8XG4gICAgICAgIHRoaXMuZ2V0TW9udGgoZmlyc3QpIC0gdGhpcy5nZXRNb250aChzZWNvbmQpIHx8XG4gICAgICAgIHRoaXMuZ2V0RGF0ZShmaXJzdCkgLSB0aGlzLmdldERhdGUoc2Vjb25kKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdHdvIGRhdGVzIGFyZSBlcXVhbC5cbiAgICogQHBhcmFtIGZpcnN0IFRoZSBmaXJzdCBkYXRlIHRvIGNoZWNrLlxuICAgKiBAcGFyYW0gc2Vjb25kIFRoZSBzZWNvbmQgZGF0ZSB0byBjaGVjay5cbiAgICogQHJldHVybnMgV2hldGhlciB0aGUgdHdvIGRhdGVzIGFyZSBlcXVhbC5cbiAgICogICAgIE51bGwgZGF0ZXMgYXJlIGNvbnNpZGVyZWQgZXF1YWwgdG8gb3RoZXIgbnVsbCBkYXRlcy5cbiAgICovXG4gIHNhbWVEYXRlKGZpcnN0OiBEIHwgbnVsbCwgc2Vjb25kOiBEIHwgbnVsbCk6IGJvb2xlYW4ge1xuICAgIGlmIChmaXJzdCAmJiBzZWNvbmQpIHtcbiAgICAgIGxldCBmaXJzdFZhbGlkID0gdGhpcy5pc1ZhbGlkKGZpcnN0KTtcbiAgICAgIGxldCBzZWNvbmRWYWxpZCA9IHRoaXMuaXNWYWxpZChzZWNvbmQpO1xuICAgICAgaWYgKGZpcnN0VmFsaWQgJiYgc2Vjb25kVmFsaWQpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLmNvbXBhcmVEYXRlKGZpcnN0LCBzZWNvbmQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZpcnN0VmFsaWQgPT0gc2Vjb25kVmFsaWQ7XG4gICAgfVxuICAgIHJldHVybiBmaXJzdCA9PSBzZWNvbmQ7XG4gIH1cblxuICAvKipcbiAgICogQ2xhbXAgdGhlIGdpdmVuIGRhdGUgYmV0d2VlbiBtaW4gYW5kIG1heCBkYXRlcy5cbiAgICogQHBhcmFtIGRhdGUgVGhlIGRhdGUgdG8gY2xhbXAuXG4gICAqIEBwYXJhbSBtaW4gVGhlIG1pbmltdW0gdmFsdWUgdG8gYWxsb3cuIElmIG51bGwgb3Igb21pdHRlZCBubyBtaW4gaXMgZW5mb3JjZWQuXG4gICAqIEBwYXJhbSBtYXggVGhlIG1heGltdW0gdmFsdWUgdG8gYWxsb3cuIElmIG51bGwgb3Igb21pdHRlZCBubyBtYXggaXMgZW5mb3JjZWQuXG4gICAqIEByZXR1cm5zIGBtaW5gIGlmIGBkYXRlYCBpcyBsZXNzIHRoYW4gYG1pbmAsIGBtYXhgIGlmIGRhdGUgaXMgZ3JlYXRlciB0aGFuIGBtYXhgLFxuICAgKiAgICAgb3RoZXJ3aXNlIGBkYXRlYC5cbiAgICovXG4gIGNsYW1wRGF0ZShkYXRlOiBELCBtaW4/OiBEIHwgbnVsbCwgbWF4PzogRCB8IG51bGwpOiBEIHtcbiAgICBpZiAobWluICYmIHRoaXMuY29tcGFyZURhdGUoZGF0ZSwgbWluKSA8IDApIHtcbiAgICAgIHJldHVybiBtaW47XG4gICAgfVxuICAgIGlmIChtYXggJiYgdGhpcy5jb21wYXJlRGF0ZShkYXRlLCBtYXgpID4gMCkge1xuICAgICAgcmV0dXJuIG1heDtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGU7XG4gIH1cbn1cbiJdfQ==