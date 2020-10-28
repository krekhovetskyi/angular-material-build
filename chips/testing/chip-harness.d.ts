/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { ChipHarnessFilters, ChipRemoveHarnessFilters } from './chip-harness-filters';
import { MatChipRemoveHarness } from './chip-remove-harness';
/** Harness for interacting with a standard Angular Material chip in tests. */
export declare class MatChipHarness extends ComponentHarness {
    /** The selector for the host element of a `MatChip` instance. */
    static hostSelector: string;
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatChipHarness` that meets
     * certain criteria.
     * @param options Options for filtering which chip instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options?: ChipHarnessFilters): HarnessPredicate<MatChipHarness>;
    /** Gets the text of the chip. */
    getText(): Promise<string>;
    /** Whether the chip is selected. */
    isSelected(): Promise<boolean>;
    /** Whether the chip is disabled. */
    isDisabled(): Promise<boolean>;
    /** Selects the given chip. Only applies if it's selectable. */
    select(): Promise<void>;
    /** Deselects the given chip. Only applies if it's selectable. */
    deselect(): Promise<void>;
    /** Toggles the selected state of the given chip. Only applies if it's selectable. */
    toggle(): Promise<void>;
    /** Removes the given chip. Only applies if it's removable. */
    remove(): Promise<void>;
    /**
     * Gets the remove button inside of a chip.
     * @param filter Optionally filters which chips are included.
     */
    getRemoveButton(filter?: ChipRemoveHarnessFilters): Promise<MatChipRemoveHarness>;
}
