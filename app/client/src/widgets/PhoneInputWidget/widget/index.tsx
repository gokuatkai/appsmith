import React from "react";
import BaseWidget, { WidgetProps, WidgetState } from "widgets/BaseWidget";
import { Alignment } from "@blueprintjs/core";
import { IconName } from "@blueprintjs/icons";
import { WidgetType, RenderModes, TextSize } from "constants/WidgetConstants";
import PhoneInputComponent, { PhoneInputComponentProps } from "../component";
import {
  EventType,
  ExecutionResult,
} from "constants/AppsmithActionConstants/ActionConstants";
import {
  ValidationTypes,
  ValidationResponse,
} from "constants/WidgetValidation";
import {
  createMessage,
  FIELD_REQUIRED_ERROR,
  INPUT_DEFAULT_TEXT_MAX_CHAR_ERROR,
} from "constants/messages";
import { DerivedPropertiesMap } from "utils/WidgetFactory";
import { InputType, InputTypes } from "../constants";
import { GRID_DENSITY_MIGRATION_V1 } from "widgets/constants";
import { ISDCodeDropdownOptions } from "../component/ISDCodeDropdown";
import { AutocompleteDataType } from "utils/autocomplete/TernServer";
import _ from "lodash";
import BaseInputWidget from "widgets/BaseInputWidget";
import derivedProperties from "./parsedDerivedProperties";

export function defaultValueValidation(
  value: any,
  props: PhoneInputWidgetProps,
  _?: any,
): ValidationResponse {
  const STRING_ERROR_MESSAGE = "This value must be string";
  const EMPTY_ERROR_MESSAGE = "";
  if (_.isObject(value)) {
    return {
      isValid: false,
      parsed: JSON.stringify(value, null, 2),
      messages: [STRING_ERROR_MESSAGE],
    };
  }
  let parsed = value;
  if (!_.isString(value)) {
    try {
      parsed = _.toString(value);
    } catch (e) {
      return {
        isValid: false,
        parsed: "",
        messages: [STRING_ERROR_MESSAGE],
      };
    }
  }
  return {
    isValid: _.isString(parsed),
    parsed: parsed,
    messages: [EMPTY_ERROR_MESSAGE],
  };
}

class PhoneInputWidget extends BaseInputWidget<
  PhoneInputWidgetProps,
  WidgetState
> {
  constructor(props: PhoneInputWidgetProps) {
    super(props);
  }
  static getPropertyPaneConfig() {
    return _.merge(super.getPropertyPaneConfig(), [
      {
        sectionName: "General",
        children: [
          {
            helpText: "Changes the country code",
            propertyName: "countryCode",
            label: "Default Country Code",
            enableSearch: true,
            dropdownHeight: "195px",
            controlType: "DROP_DOWN",
            placeholderText: "Search by code or country name",
            options: ISDCodeDropdownOptions,
            isBindProperty: false,
            isTriggerProperty: false,
          },
          {
            helpText:
              "Sets the default text of the widget. The text is updated if the default text changes",
            propertyName: "defaultText",
            label: "Default Text",
            controlType: "INPUT_TEXT",
            placeholderText: "John Doe",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.FUNCTION,
              params: {
                fn: defaultValueValidation,
                expected: {
                  type: "string",
                  example: `000 0000`,
                  autocompleteDataType: AutocompleteDataType.STRING,
                },
              },
            },
          },
        ],
      },
    ]);
  }

  static getDerivedPropertiesMap(): DerivedPropertiesMap {
    return _.merge(super.getDerivedPropertiesMap(), {
      isValid: `{{(() => {${derivedProperties.isValid}})()}}`,
    });
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return _.merge(super.getMetaPropertiesMap(), {
      selectedCountryCode: undefined,
    });
  }

  onISDCodeChange = (code?: string) => {
    const countryCode = code;
    if (this.props.renderMode === RenderModes.CANVAS) {
      super.updateWidgetProperty("countryCode", countryCode);
    } else {
      this.props.updateWidgetMetaProperty(
        "selectedPhoneNumberCountryCode",
        countryCode,
      );
    }
  };

  onValueChange = (value: string) => {
    this.props.updateWidgetMetaProperty("text", value, {
      triggerPropertyName: "onTextChanged",
      dynamicString: this.props.onTextChanged,
      event: {
        type: EventType.ON_TEXT_CHANGE,
      },
    });
    if (!this.props.isDirty) {
      this.props.updateWidgetMetaProperty("isDirty", true);
    }
  };

  getPageView() {
    const value = this.props.text ?? "";
    const isInvalid =
      "isValid" in this.props && !this.props.isValid && !!this.props.isDirty;
    const countryCode = this.props.selectedPhoneNumberCountryCode
      ? this.props.selectedPhoneNumberCountryCode
      : this.props.countryCode;
    const conditionalProps: Partial<PhoneInputComponentProps> = {};
    conditionalProps.errorMessage = this.props.errorMessage;
    if (this.props.isRequired && value.length === 0) {
      conditionalProps.errorMessage = createMessage(FIELD_REQUIRED_ERROR);
    }
    const minInputSingleLineHeight =
      this.props.label || this.props.tooltip
        ? // adjust height for label | tooltip extra div
          GRID_DENSITY_MIGRATION_V1 + 4
        : // GRID_DENSITY_MIGRATION_V1 used to adjust code as per new scaled canvas.
          GRID_DENSITY_MIGRATION_V1;

    return (
      <PhoneInputComponent
        autoFocus={this.props.autoFocus}
        // show label and Input side by side if true
        compactMode={
          !(
            (this.props.bottomRow - this.props.topRow) /
              GRID_DENSITY_MIGRATION_V1 >
              1 && this.props.inputType === "TEXT"
          )
        }
        countryCode={countryCode}
        defaultValue={this.props.defaultText}
        disableNewLineOnPressEnterKey={!!this.props.onSubmit}
        disabled={this.props.isDisabled}
        iconAlign={this.props.iconAlign}
        iconName={this.props.iconName}
        isInvalid={isInvalid}
        isLoading={this.props.isLoading}
        label={this.props.label}
        labelStyle={this.props.labelStyle}
        labelTextColor={this.props.labelTextColor}
        labelTextSize={this.props.labelTextSize}
        onFocusChange={this.handleFocusChange}
        onISDCodeChange={this.onISDCodeChange}
        onKeyDown={this.handleKeyDown}
        onValueChange={this.onValueChange}
        placeholder={this.props.placeholderText}
        showError={!!this.props.isFocused}
        tooltip={this.props.tooltip}
        value={value}
        widgetId={this.props.widgetId}
        {...conditionalProps}
      />
    );
  }

  static getWidgetType(): WidgetType {
    return "PHONE_INPUT_WIDGET";
  }
}

export interface PhoneInputValidator {
  validationRegex: string;
  errorMessage: string;
}
export interface PhoneInputWidgetProps extends WidgetProps {
  inputType: InputType;
  countryCode?: string;
  defaultText?: string | number;
  tooltip?: string;
  isDisabled?: boolean;
  validation: boolean;
  text: string;
  regex?: string;
  errorMessage?: string;
  placeholderText?: string;
  onTextChanged?: string;
  label: string;
  labelTextColor?: string;
  labelTextSize?: TextSize;
  labelStyle?: string;
  inputValidators: PhoneInputValidator[];
  isValid: boolean;
  focusIndex?: number;
  isAutoFocusEnabled?: boolean;
  isRequired?: boolean;
  isFocused?: boolean;
  isDirty?: boolean;
  autoFocus?: boolean;
  iconName?: IconName;
  iconAlign?: Omit<Alignment, "center">;
  onSubmit?: string;
}

export default PhoneInputWidget;
