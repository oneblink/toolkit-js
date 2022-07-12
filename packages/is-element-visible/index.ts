import { FormTypes } from '@oneblink/types'
import {
  conditionalLogicService,
  formElementsService,
} from '@oneblink/sdk-core'

export default function isShowing(
  element: string | FormTypes.FormElement,
  submission: Record<string, unknown>,
  elements: FormTypes.FormElement[],
) {
  //if element has been supplied as type FormElement then use it otherwise find it
  const targetElement =
    typeof element === 'string'
      ? formElementsService.findFormElement(
          elements,
          (el) => 'name' in el && el.name === element,
        )
      : element

  if (targetElement) {
    return conditionalLogicService.evaluateConditionalPredicates({
      isConditional: targetElement.conditionallyShow,
      requiresAllConditionalPredicates:
        !!targetElement.requiresAllConditionallyShowPredicates,
      conditionalPredicates: targetElement.conditionallyShowPredicates || [],
      submission,
      formElements: elements,
    })
  }

  return false
}
