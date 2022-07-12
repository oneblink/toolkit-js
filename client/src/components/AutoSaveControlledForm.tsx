import {
  useMemo,
  useCallback,
  PropsWithChildren,
  createContext,
  useContext,
  SetStateAction,
} from 'react'
import {
  OneBlinkFormControlled,
  useFormSubmissionAutoSaveState,
} from '@oneblink/apps-react'
import { submissionService } from '@oneblink/apps'
import { FormTypes } from '@oneblink/types'

interface FormSubmissionState {
  definition: FormTypes.Form
  submission: Record<string, unknown>
}

interface Props {
  form: FormTypes.Form
  initialSubmission?: Record<string, unknown>
  onSubmit: (newFormSubmission: submissionService.NewFormSubmission) => void
  onSaveDraft?: (
    newDraftSubmission: submissionService.NewDraftSubmission,
  ) => void
  onCancel: () => void
  googleMapsApiKey?: string
  captchaSiteKey?: string
  buttons?: Record<string, unknown>
  updateSubmission: (
    submission: Record<string, unknown>,
  ) => Record<string, unknown>
  updateDefinition: (
    submission: Record<string, unknown>,
    definition: FormTypes.Form,
  ) => FormTypes.Form
  isSubmitting: boolean
  existingTrackingCode?: string
  autoSaveKey: string
}

interface TAutoSaveControlledFormContext {
  isSubmitting?: boolean
  existingTrackingCode?: string
  isLoadingAutoSaveSubmission?: boolean
  isAutoSaveSubmissionAvailable?: boolean
  startNewSubmission?: () => void
  continueAutoSaveSubmission?: () => void
}

const AutoSaveControlledFormContext =
  createContext<TAutoSaveControlledFormContext>({})

export function useAutoSaveControlledForm() {
  return useContext(AutoSaveControlledFormContext)
}

export default function AutoSaveControlledForm({
  form,
  initialSubmission,
  onSubmit,
  onSaveDraft,
  onCancel,
  googleMapsApiKey,
  captchaSiteKey,
  buttons,
  updateSubmission,
  updateDefinition,
  isSubmitting,
  existingTrackingCode,
  autoSaveKey,
  children,
}: PropsWithChildren<Props>) {
  const {
    definition,
    submission: liveSubmission,
    isLoadingAutoSaveSubmission,
    isAutoSaveSubmissionAvailable,
    startNewSubmission,
    continueAutoSaveSubmission,
    handleSubmit,
    handleCancel,
    handleSaveDraft,
    setFormSubmission,
  } = useFormSubmissionAutoSaveState({
    form,
    initialSubmission,
    autoSaveKey,
    onSubmit,
    onCancel,
    onSaveDraft,
    removeAutoSaveDataBeforeSaveDraft: false,
    removeAutoSaveDataBeforeSubmit: false,
  })

  /* update definition here */
  const customDefinition = useMemo(() => {
    return updateDefinition(liveSubmission, definition)
  }, [definition, liveSubmission, updateDefinition])

  /* update subsmission data here */
  const customSetFormSubmission = useCallback(
    (
      formSubmission: SetStateAction<FormSubmissionState> | FormSubmissionState,
    ) => {
      setFormSubmission((currentState: FormSubmissionState) => {
        const newFormSubmission: FormSubmissionState =
          typeof formSubmission === 'function'
            ? formSubmission(currentState)
            : formSubmission

        return {
          ...newFormSubmission,
          submission: updateSubmission(newFormSubmission.submission),
        }
      })
    },
    [setFormSubmission, updateSubmission],
  )

  const value = useMemo(() => {
    return {
      isSubmitting,
      existingTrackingCode,
      isLoadingAutoSaveSubmission,
      isAutoSaveSubmissionAvailable,
      startNewSubmission,
      continueAutoSaveSubmission,
    }
  }, [])

  return (
    <>
      <OneBlinkFormControlled
        definition={customDefinition}
        submission={liveSubmission}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        googleMapsApiKey={googleMapsApiKey}
        captchaSiteKey={captchaSiteKey}
        buttons={buttons}
        setFormSubmission={customSetFormSubmission}
      />
      <AutoSaveControlledFormContext.Provider value={value}>
        {children}
      </AutoSaveControlledFormContext.Provider>
    </>
  )
}
