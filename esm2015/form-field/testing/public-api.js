/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// Re-export everything from the "form-field/testing/control" entry-point. To avoid
// circular dependencies, harnesses for default form-field controls (i.e. input, select)
// need to import the base form-field control harness through a separate entry-point.
export * from '@angular/material/form-field/testing/control';
export * from './form-field-harness';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGljLWFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9mb3JtLWZpZWxkL3Rlc3RpbmcvcHVibGljLWFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxtRkFBbUY7QUFDbkYsd0ZBQXdGO0FBQ3hGLHFGQUFxRjtBQUNyRixjQUFjLDhDQUE4QyxDQUFDO0FBRTdELGNBQWMsc0JBQXNCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gUmUtZXhwb3J0IGV2ZXJ5dGhpbmcgZnJvbSB0aGUgXCJmb3JtLWZpZWxkL3Rlc3RpbmcvY29udHJvbFwiIGVudHJ5LXBvaW50LiBUbyBhdm9pZFxuLy8gY2lyY3VsYXIgZGVwZW5kZW5jaWVzLCBoYXJuZXNzZXMgZm9yIGRlZmF1bHQgZm9ybS1maWVsZCBjb250cm9scyAoaS5lLiBpbnB1dCwgc2VsZWN0KVxuLy8gbmVlZCB0byBpbXBvcnQgdGhlIGJhc2UgZm9ybS1maWVsZCBjb250cm9sIGhhcm5lc3MgdGhyb3VnaCBhIHNlcGFyYXRlIGVudHJ5LXBvaW50LlxuZXhwb3J0ICogZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZm9ybS1maWVsZC90ZXN0aW5nL2NvbnRyb2wnO1xuXG5leHBvcnQgKiBmcm9tICcuL2Zvcm0tZmllbGQtaGFybmVzcyc7XG5leHBvcnQgKiBmcm9tICcuL2Zvcm0tZmllbGQtaGFybmVzcy1maWx0ZXJzJztcbiJdfQ==