import { DebugElement } from '@angular/core';
import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { TodoService } from './todo.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let items: string[];
  let addedItems: string[];
  let completedItems: string[];

  class FakeTestingService {
    async fetchItems(): Promise<string[]> {
      return Promise.resolve(items);
    }

    async addItem(item: string): Promise<void> {
      addedItems.push(item);
      return Promise.resolve();
    }

    async completeItem(item: string): Promise<void> {
      completedItems.push(item);
      return Promise.resolve();
    }
  }

  beforeEach(async(() => {
    items = [];
    addedItems = [];
    completedItems = [];
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
      ],
      imports: [
        FormsModule,
        MatButtonModule,
        MatCardModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatListModule,
        MatMomentDateModule,
        MatSelectModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        { provide: TodoService, useValue: new FakeTestingService() },
      ],
    }).compileComponents();
  }));

  it('loads items from the backend', async () => {
    items = ['An item'];
    fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();

    expect(itemsList()).toContain('An item');
  });

  describe('Adding and removing items', () => {
    beforeEach(async(() => {
      fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
    }));

    it('adds an item to the list', async () => {
      await addItemToList('An item');

      expect(itemsList()).toContain('An item');
    });

    it('adds an item on the backend', async () => {
      await addItemToList('An item');

      expect(addedItems).toContain('An item');
    });

    it('clears the input once the button is clicked', async () => {
      await addItemToList('An item');

      expect(addItemInput().nativeElement.value).toEqual('');
    });

    it('removes an item from the list', async () => {
      await addItemToList('An item');

      await removeItemFromList(0);

      expect(itemsList()).not.toContain('An item');
    });

    it('completes an item on the backend', async () => {
      await addItemToList('An item');

      await removeItemFromList(0);

      expect(completedItems).toContain('An item');
    });

    it('disables the add button until text is entered', () => {
      expect(addItemButton().nativeElement.attributes['disabled']).toBeTruthy;
    });

    it('enables the add button when text is entered', () => {
      inputText(addItemInput(), 'An item');

      expect(addItemButton().nativeElement.attributes['disabled']).not.toBeTruthy;
    });

    async function addItemToList(item: string) {
      inputText(addItemInput(), item);
      addItemButton().nativeElement.click();
      await fixture.whenStable();
    }

    async function removeItemFromList(index: number) {
      fixture.debugElement
          .query(By.css(`#todo-list mat-list-option:nth-of-type(${index + 1}) mat-pseudo-checkbox`))
          .nativeElement
          .click();
      await fixture.whenStable();
    }

    function addItemInput(): DebugElement {
      return fixture.debugElement.query(By.css('#label-input'));
    }

    function addItemButton(): DebugElement {
      return fixture.debugElement.query(By.css('#add-item-button'));
    }

    function inputText(element: DebugElement, value: string) {
      element.nativeElement.value = value;
      element.nativeElement.dispatchEvent(new Event('input'));
    }
  });

  describe('New item form elements', () => {
    beforeEach(async(() => {
      fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
    }));

    it('displays the amount input when shopping item selected', async () => {
      await selectItemType('shopping');

      expect(amountInputFormElement()).toBeTruthy();
    });

    for (let type of ['task', 'recurring']) {
      it(`hides the amount input when ${type} selected`, async () => {
        await selectItemType(type);

        expect(amountInputFormElement()).not.toBeTruthy();
      });
    }

    it('displays the deadline input when task selected', async () => {
      await selectItemType('task');

      expect(deadlinePart()).toBeTruthy();
    });

    for (let type of ['recurring', 'shopping']) {
      it(`hides the deadline input when ${type} selected`, async () => {
        await selectItemType(type);

        expect(deadlinePart()).not.toBeTruthy();
      });
    }

    it('displays the repeat input when recurring selected', async () => {
      await selectItemType('recurring');

      expect(repeatPart()).toBeTruthy();
    });

    for (let type of ['task', 'shopping']) {
      it(`hides the repeat input when ${type} selected`, async () => {
        await selectItemType(type);

        expect(repeatPart()).not.toBeTruthy();
      });
    }
    async function selectItemType(type: string) {
      fixture.debugElement.query(By.css('.new-item-type-select .mat-select-trigger')).nativeElement.click();
      fixture.detectChanges();
      fixture.debugElement.query(By.css(`mat-option.item-type[value="${type}"]`)).nativeElement.click();
      await fixture.whenStable();
    }

    function amountInputFormElement(): DebugElement {
      return fixture.debugElement.query(By.css('.amount-input'));
    }

    function deadlinePart(): DebugElement {
      return fixture.debugElement.query(By.css('.deadline-part'));
    }

    function repeatPart(): DebugElement {
      return fixture.debugElement.query(By.css('.repeat-part'));
    }
  });

  function itemsList(): string[] {
    return fixture.debugElement
        .queryAll(By.css('#todo-list mat-list-option'))
        .map((item) => item.nativeElement.innerText);
  }
});