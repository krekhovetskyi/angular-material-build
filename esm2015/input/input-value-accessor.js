/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken } from '@angular/core';
/**
 * This token is used to inject the object whose value should be set into `MatInput`. If none is
 * provided, the native `HTMLInputElement` is used. Directives like `MatDatepickerInput` can provide
 * themselves for this token, in order to make `MatInput` delegate the getting and setting of the
 * value to them.
 */
export const MAT_INPUT_VALUE_ACCESSOR = new InjectionToken('MAT_INPUT_VALUE_ACCESSOR');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtdmFsdWUtYWNjZXNzb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvaW5wdXQvaW5wdXQtdmFsdWUtYWNjZXNzb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUc3Qzs7Ozs7R0FLRztBQUNILE1BQU0sQ0FBQyxNQUFNLHdCQUF3QixHQUNqQyxJQUFJLGNBQWMsQ0FBZSwwQkFBMEIsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0aW9uVG9rZW59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5cbi8qKlxuICogVGhpcyB0b2tlbiBpcyB1c2VkIHRvIGluamVjdCB0aGUgb2JqZWN0IHdob3NlIHZhbHVlIHNob3VsZCBiZSBzZXQgaW50byBgTWF0SW5wdXRgLiBJZiBub25lIGlzXG4gKiBwcm92aWRlZCwgdGhlIG5hdGl2ZSBgSFRNTElucHV0RWxlbWVudGAgaXMgdXNlZC4gRGlyZWN0aXZlcyBsaWtlIGBNYXREYXRlcGlja2VySW5wdXRgIGNhbiBwcm92aWRlXG4gKiB0aGVtc2VsdmVzIGZvciB0aGlzIHRva2VuLCBpbiBvcmRlciB0byBtYWtlIGBNYXRJbnB1dGAgZGVsZWdhdGUgdGhlIGdldHRpbmcgYW5kIHNldHRpbmcgb2YgdGhlXG4gKiB2YWx1ZSB0byB0aGVtLlxuICovXG5leHBvcnQgY29uc3QgTUFUX0lOUFVUX1ZBTFVFX0FDQ0VTU09SID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48e3ZhbHVlOiBhbnl9PignTUFUX0lOUFVUX1ZBTFVFX0FDQ0VTU09SJyk7XG4iXX0=