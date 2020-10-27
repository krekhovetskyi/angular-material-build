/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export { MatTabsModule } from './tabs-module';
export * from './tab-group';
export { MatInkBar, _MAT_INK_BAR_POSITIONER } from './ink-bar';
export { MatTabBody, _MatTabBodyBase, MatTabBodyPortal } from './tab-body';
export { MatTabHeader, _MatTabHeaderBase } from './tab-header';
export { MatTabLabelWrapper } from './tab-label-wrapper';
export { MatTab, MAT_TAB_GROUP } from './tab';
export { MatTabLabel } from './tab-label';
export { MatTabNav, MatTabLink, _MatTabNavBase, _MatTabLinkBase } from './tab-nav-bar/index';
export { MatTabContent } from './tab-content';
export * from './tabs-animations';
export { MAT_TABS_CONFIG } from './tab-config';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGljLWFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC90YWJzL3B1YmxpYy1hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM1QyxjQUFjLGFBQWEsQ0FBQztBQUM1QixPQUFPLEVBQUMsU0FBUyxFQUF3Qix1QkFBdUIsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUNuRixPQUFPLEVBQ0wsVUFBVSxFQUNWLGVBQWUsRUFHZixnQkFBZ0IsRUFDakIsTUFBTSxZQUFZLENBQUM7QUFDcEIsT0FBTyxFQUFDLFlBQVksRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUM3RCxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUMsTUFBTSxFQUFFLGFBQWEsRUFBQyxNQUFNLE9BQU8sQ0FBQztBQUM1QyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMzRixPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTVDLGNBQWMsbUJBQW1CLENBQUM7QUFDbEMsT0FBTyxFQUFDLGVBQWUsRUFBZ0IsTUFBTSxjQUFjLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0IHtNYXRUYWJzTW9kdWxlfSBmcm9tICcuL3RhYnMtbW9kdWxlJztcbmV4cG9ydCAqIGZyb20gJy4vdGFiLWdyb3VwJztcbmV4cG9ydCB7TWF0SW5rQmFyLCBfTWF0SW5rQmFyUG9zaXRpb25lciwgX01BVF9JTktfQkFSX1BPU0lUSU9ORVJ9IGZyb20gJy4vaW5rLWJhcic7XG5leHBvcnQge1xuICBNYXRUYWJCb2R5LFxuICBfTWF0VGFiQm9keUJhc2UsXG4gIE1hdFRhYkJvZHlPcmlnaW5TdGF0ZSxcbiAgTWF0VGFiQm9keVBvc2l0aW9uU3RhdGUsXG4gIE1hdFRhYkJvZHlQb3J0YWxcbn0gZnJvbSAnLi90YWItYm9keSc7XG5leHBvcnQge01hdFRhYkhlYWRlciwgX01hdFRhYkhlYWRlckJhc2V9IGZyb20gJy4vdGFiLWhlYWRlcic7XG5leHBvcnQge01hdFRhYkxhYmVsV3JhcHBlcn0gZnJvbSAnLi90YWItbGFiZWwtd3JhcHBlcic7XG5leHBvcnQge01hdFRhYiwgTUFUX1RBQl9HUk9VUH0gZnJvbSAnLi90YWInO1xuZXhwb3J0IHtNYXRUYWJMYWJlbH0gZnJvbSAnLi90YWItbGFiZWwnO1xuZXhwb3J0IHtNYXRUYWJOYXYsIE1hdFRhYkxpbmssIF9NYXRUYWJOYXZCYXNlLCBfTWF0VGFiTGlua0Jhc2V9IGZyb20gJy4vdGFiLW5hdi1iYXIvaW5kZXgnO1xuZXhwb3J0IHtNYXRUYWJDb250ZW50fSBmcm9tICcuL3RhYi1jb250ZW50JztcbmV4cG9ydCB7U2Nyb2xsRGlyZWN0aW9ufSBmcm9tICcuL3BhZ2luYXRlZC10YWItaGVhZGVyJztcbmV4cG9ydCAqIGZyb20gJy4vdGFicy1hbmltYXRpb25zJztcbmV4cG9ydCB7TUFUX1RBQlNfQ09ORklHLCBNYXRUYWJzQ29uZmlnfSBmcm9tICcuL3RhYi1jb25maWcnO1xuIl19