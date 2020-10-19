/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HarnessPredicate } from '@angular/cdk/testing';
import { MatListHarnessBase } from './list-harness-base';
import { getListItemPredicate, MatListItemHarnessBase } from './list-item-harness-base';
/** Harness for interacting with a standard mat-list in tests. */
export class MatListHarness extends MatListHarnessBase {
    constructor() {
        super(...arguments);
        this._itemHarness = MatListItemHarness;
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatListHarness` that meets certain
     * criteria.
     * @param options Options for filtering which list instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatListHarness, options);
    }
}
/** The selector for the host element of a `MatList` instance. */
MatListHarness.hostSelector = '.mat-list:not(mat-action-list):not(mat-nav-list):not(mat-selection-list)';
/** Harness for interacting with a list item. */
export class MatListItemHarness extends MatListItemHarnessBase {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatListItemHarness` that meets
     * certain criteria.
     * @param options Options for filtering which list item instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return getListItemPredicate(MatListItemHarness, options);
    }
}
/** The selector for the host element of a `MatListItem` instance. */
MatListItemHarness.hostSelector = ['mat-list-item', 'a[mat-list-item]', 'button[mat-list-item]']
    .map(selector => `${MatListHarness.hostSelector} ${selector}`)
    .join(',');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2xpc3QvdGVzdGluZy9saXN0LWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDdEQsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFFdkQsT0FBTyxFQUFDLG9CQUFvQixFQUFFLHNCQUFzQixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFFdEYsaUVBQWlFO0FBQ2pFLE1BQU0sT0FBTyxjQUFlLFNBQ3hCLGtCQUF5RjtJQUQ3Rjs7UUFlRSxpQkFBWSxHQUFHLGtCQUFrQixDQUFDO0lBQ3BDLENBQUM7SUFYQzs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBOEIsRUFBRTtRQUMxQyxPQUFPLElBQUksZ0JBQWdCLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZELENBQUM7O0FBWEQsaUVBQWlFO0FBQzFELDJCQUFZLEdBQUcsMEVBQTBFLENBQUM7QUFlbkcsZ0RBQWdEO0FBQ2hELE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxzQkFBc0I7SUFNNUQ7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQWtDLEVBQUU7UUFDOUMsT0FBTyxvQkFBb0IsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMzRCxDQUFDOztBQWJELHFFQUFxRTtBQUM5RCwrQkFBWSxHQUFHLENBQUMsZUFBZSxFQUFFLGtCQUFrQixFQUFFLHVCQUF1QixDQUFDO0tBQy9FLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsY0FBYyxDQUFDLFlBQVksSUFBSSxRQUFRLEVBQUUsQ0FBQztLQUM3RCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtIYXJuZXNzUHJlZGljYXRlfSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XG5pbXBvcnQge01hdExpc3RIYXJuZXNzQmFzZX0gZnJvbSAnLi9saXN0LWhhcm5lc3MtYmFzZSc7XG5pbXBvcnQge0xpc3RIYXJuZXNzRmlsdGVycywgTGlzdEl0ZW1IYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9saXN0LWhhcm5lc3MtZmlsdGVycyc7XG5pbXBvcnQge2dldExpc3RJdGVtUHJlZGljYXRlLCBNYXRMaXN0SXRlbUhhcm5lc3NCYXNlfSBmcm9tICcuL2xpc3QtaXRlbS1oYXJuZXNzLWJhc2UnO1xuXG4vKiogSGFybmVzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIHN0YW5kYXJkIG1hdC1saXN0IGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdExpc3RIYXJuZXNzIGV4dGVuZHNcbiAgICBNYXRMaXN0SGFybmVzc0Jhc2U8dHlwZW9mIE1hdExpc3RJdGVtSGFybmVzcywgTWF0TGlzdEl0ZW1IYXJuZXNzLCBMaXN0SXRlbUhhcm5lc3NGaWx0ZXJzPiB7XG4gIC8qKiBUaGUgc2VsZWN0b3IgZm9yIHRoZSBob3N0IGVsZW1lbnQgb2YgYSBgTWF0TGlzdGAgaW5zdGFuY2UuICovXG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1saXN0Om5vdChtYXQtYWN0aW9uLWxpc3QpOm5vdChtYXQtbmF2LWxpc3QpOm5vdChtYXQtc2VsZWN0aW9uLWxpc3QpJztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSBgTWF0TGlzdEhhcm5lc3NgIHRoYXQgbWVldHMgY2VydGFpblxuICAgKiBjcml0ZXJpYS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIGxpc3QgaW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkIGEgbWF0Y2guXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGgob3B0aW9uczogTGlzdEhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdExpc3RIYXJuZXNzPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKE1hdExpc3RIYXJuZXNzLCBvcHRpb25zKTtcbiAgfVxuXG4gIF9pdGVtSGFybmVzcyA9IE1hdExpc3RJdGVtSGFybmVzcztcbn1cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBsaXN0IGl0ZW0uICovXG5leHBvcnQgY2xhc3MgTWF0TGlzdEl0ZW1IYXJuZXNzIGV4dGVuZHMgTWF0TGlzdEl0ZW1IYXJuZXNzQmFzZSB7XG4gIC8qKiBUaGUgc2VsZWN0b3IgZm9yIHRoZSBob3N0IGVsZW1lbnQgb2YgYSBgTWF0TGlzdEl0ZW1gIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gWydtYXQtbGlzdC1pdGVtJywgJ2FbbWF0LWxpc3QtaXRlbV0nLCAnYnV0dG9uW21hdC1saXN0LWl0ZW1dJ11cbiAgICAgIC5tYXAoc2VsZWN0b3IgPT4gYCR7TWF0TGlzdEhhcm5lc3MuaG9zdFNlbGVjdG9yfSAke3NlbGVjdG9yfWApXG4gICAgICAuam9pbignLCcpO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIGBNYXRMaXN0SXRlbUhhcm5lc3NgIHRoYXQgbWVldHNcbiAgICogY2VydGFpbiBjcml0ZXJpYS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIGxpc3QgaXRlbSBpbnN0YW5jZXMgYXJlIGNvbnNpZGVyZWQgYSBtYXRjaC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBMaXN0SXRlbUhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdExpc3RJdGVtSGFybmVzcz4ge1xuICAgIHJldHVybiBnZXRMaXN0SXRlbVByZWRpY2F0ZShNYXRMaXN0SXRlbUhhcm5lc3MsIG9wdGlvbnMpO1xuICB9XG59XG4iXX0=