/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { CdkTreeNodeToggle } from '@angular/cdk/tree';
import { Directive, Input } from '@angular/core';
/**
 * Wrapper for the CdkTree's toggle with Material design styles.
 */
// tslint:disable-next-line: coercion-types
export class MatTreeNodeToggle extends CdkTreeNodeToggle {
    get recursive() { return this._recursive; }
    set recursive(value) {
        // TODO: when we remove support for ViewEngine, change this setter to an input
        // alias in the decorator metadata.
        this._recursive = coerceBooleanProperty(value);
    }
}
MatTreeNodeToggle.decorators = [
    { type: Directive, args: [{
                selector: '[matTreeNodeToggle]',
                providers: [{ provide: CdkTreeNodeToggle, useExisting: MatTreeNodeToggle }]
            },] }
];
MatTreeNodeToggle.propDecorators = {
    recursive: [{ type: Input, args: ['matTreeNodeToggleRecursive',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3RyZWUvdG9nZ2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzVELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ3BELE9BQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRS9DOztHQUVHO0FBS0gsMkNBQTJDO0FBQzNDLE1BQU0sT0FBTyxpQkFBcUIsU0FBUSxpQkFBb0I7SUFDNUQsSUFDSSxTQUFTLEtBQWMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUNwRCxJQUFJLFNBQVMsQ0FBQyxLQUFjO1FBQzFCLDhFQUE4RTtRQUM5RSxtQ0FBbUM7UUFDbkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqRCxDQUFDOzs7WUFaRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLHFCQUFxQjtnQkFDL0IsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFDLENBQUM7YUFDMUU7Ozt3QkFHRSxLQUFLLFNBQUMsNEJBQTRCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Y29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtDZGtUcmVlTm9kZVRvZ2dsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3RyZWUnO1xuaW1wb3J0IHtEaXJlY3RpdmUsIElucHV0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuLyoqXG4gKiBXcmFwcGVyIGZvciB0aGUgQ2RrVHJlZSdzIHRvZ2dsZSB3aXRoIE1hdGVyaWFsIGRlc2lnbiBzdHlsZXMuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1ttYXRUcmVlTm9kZVRvZ2dsZV0nLFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogQ2RrVHJlZU5vZGVUb2dnbGUsIHVzZUV4aXN0aW5nOiBNYXRUcmVlTm9kZVRvZ2dsZX1dXG59KVxuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBjb2VyY2lvbi10eXBlc1xuZXhwb3J0IGNsYXNzIE1hdFRyZWVOb2RlVG9nZ2xlPFQ+IGV4dGVuZHMgQ2RrVHJlZU5vZGVUb2dnbGU8VD4ge1xuICBASW5wdXQoJ21hdFRyZWVOb2RlVG9nZ2xlUmVjdXJzaXZlJylcbiAgZ2V0IHJlY3Vyc2l2ZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3JlY3Vyc2l2ZTsgfVxuICBzZXQgcmVjdXJzaXZlKHZhbHVlOiBib29sZWFuKSB7XG4gICAgLy8gVE9ETzogd2hlbiB3ZSByZW1vdmUgc3VwcG9ydCBmb3IgVmlld0VuZ2luZSwgY2hhbmdlIHRoaXMgc2V0dGVyIHRvIGFuIGlucHV0XG4gICAgLy8gYWxpYXMgaW4gdGhlIGRlY29yYXRvciBtZXRhZGF0YS5cbiAgICB0aGlzLl9yZWN1cnNpdmUgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG59XG4iXX0=