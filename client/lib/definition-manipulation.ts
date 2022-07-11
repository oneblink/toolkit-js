import { FormTypes } from "@oneblink/types";
import { FormElement } from "@oneblink/types/typescript/forms";
import {
  conditionalLogicService,
  formElementsService,
} from "@oneblink/sdk-core";

import _cloneDeep from "lodash.clonedeep";
interface HasChildren {
  elements?: FormElement[];
}

export function insertAfter(
  elements: FormTypes.FormElement[],
  targetElement: FormTypes.FormElement,
  insertElement: FormTypes.FormElement
) {
  const newEls = [];
  for (let i = 0; i < elements.length; i++) {
    newEls.push(_cloneDeep(elements[i]));
    if (elements[i] === targetElement) {
      newEls.push(_cloneDeep(insertElement));
    }
  }

  return newEls;
}

export function replaceElement(
  elements: FormTypes.FormElement[],
  targetElement: FormTypes.FormElement,
  insertElement: FormTypes.FormElement
) {
  return elements.reduce((memo: FormElement[], el) => {
    if (el.id === targetElement.id) memo.push(_cloneDeep(insertElement));
    else memo.push(_cloneDeep(el));

    return memo;
  }, []);
}

export function removeElement(
  elements: FormTypes.FormElement[],
  targetElement: FormTypes.FormElement
) {
  return elements.reduce((memo: FormElement[], el) => {
    if (el.id !== targetElement.id) memo.push(_cloneDeep(el));

    return memo;
  }, []);
}

export function findElement<T extends FormTypes.FormElement>(
  parentElement: HasChildren,
  elementNameToFind: string
): {
  parent: HasChildren;
  value: T;
} | void {
  for (const iterElement of parentElement.elements || []) {
    switch (iterElement.type) {
      case "form":
      case "repeatableSet":
      case "page":
      case "infoPage":
      case "section":
        if ("name" in iterElement && iterElement.name === elementNameToFind)
          return { parent: parentElement, value: iterElement as T };
        const result = findElement<T>(
          iterElement as HasChildren,
          elementNameToFind
        );
        if (result) return result;
        break;
      default:
        if (iterElement.name === elementNameToFind) {
          return { parent: parentElement, value: iterElement as T };
        }
    }
  }
}

export function findPage(definition: FormTypes.Form, pageLabel: string) {
  const pageElement = definition.elements.find(
    (element) => element.type === "page" && element.label === pageLabel
  );

  if (pageElement) {
    return pageElement as FormTypes.PageElement;
  }
}

export function findSubForm(
  parentElement: HasChildren,
  formNameToFind: string
): {
  parent: HasChildren;
  value: FormTypes.FormFormElement;
} | void {
  for (const iterElement of parentElement.elements || []) {
    if (iterElement.type === "form" && iterElement.name === formNameToFind) {
      return { parent: parentElement, value: iterElement };
    }
    switch (iterElement.type) {
      case "form":
      case "repeatableSet":
      case "page":
      case "infoPage":
      case "section":
        const result = findSubForm(iterElement as HasChildren, formNameToFind);
        if (result) return result;
        break;
    }
  }
}

export function findTag(formDefinition: FormTypes.Form, tagName: string) {
  return formDefinition.tags.find(
    (tag) => tag.toLowerCase() === tagName.toLowerCase()
  );
}

export function replaceElementOptions(
  definition: HasChildren,
  elementName: string,
  options: unknown[],
  otherValue = "Other"
) {
  const optionSet = formElementsService.parseFormElementOptionsSet(options);
  const element = findElement<FormTypes.FormElementWithOptions>(
    definition,
    elementName
  );

  if (
    element &&
    element.value &&
    element.value.options &&
    element.parent &&
    element.parent.elements
  ) {
    const otherOption = element.value.options.find(
      (opt) => opt.value.toLowerCase() === otherValue?.toLowerCase()
    );
    if (
      otherOption &&
      //user hasn't entered something that matches other (for some reason)
      !optionSet.find(
        (option) =>
          otherOption.value.toLowerCase() === option.value.toLowerCase()
      )
    ) {
      optionSet.push(otherOption);
    }
    element.parent.elements = replaceElement(
      element.parent.elements,
      element.value,
      {
        ...element.value,
        options: optionSet,
      }
    );
  }

  return definition;
}

export const isVisible =
  (submission: Record<string, unknown>, elements: FormTypes.FormElement[]) =>
  (el: FormTypes.FormElement | void) => {
    if (el && el.conditionallyShowPredicates) {
      const result = conditionalLogicService.evaluateConditionalPredicates({
        isConditional: el.conditionallyShow,
        conditionalPredicates: el.conditionallyShowPredicates,
        requiresAllConditionalPredicates:
          el.requiresAllConditionallyShowPredicates ?? false,
        formElements: elements,
        submission,
      });

      return result;
    }

    return true;
  };
