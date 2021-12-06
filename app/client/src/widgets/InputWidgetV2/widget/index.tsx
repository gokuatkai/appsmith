import React from "react";
import BaseWidget, { WidgetProps, WidgetState } from "widgets/BaseWidget";
import { Alignment } from "@blueprintjs/core";
import { IconName } from "@blueprintjs/icons";
import { WidgetType, RenderModes, TextSize } from "constants/WidgetConstants";
import InputComponent, { InputComponentProps } from "../component";
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
import { AutocompleteDataType } from "utils/autocomplete/TernServer";
import BaseInputWidget from "widgets/BaseInputWidget";
import _ from "lodash";
import derivedProperties from "./parsedDerivedProperties";

export function defaultValueValidation(
  value: any,
  props: InputWidgetProps,
  _?: any,
): ValidationResponse {
  const STRING_ERROR_MESSAGE = "This value must be string";
  const NUMBER_ERROR_MESSAGE = "This value must be number";
  const EMPTY_ERROR_MESSAGE = "";
  if (_.isObject(value)) {
    return {
      isValid: false,
      parsed: JSON.stringify(value, null, 2),
      messages: [STRING_ERROR_MESSAGE],
    };
  }

  const { inputType } = props;
  let parsed;
  switch (inputType) {
    case "INTEGER":
    case "NUMBER":
      parsed = Number(value);
      let isValid, messages;

      if (_.isString(value) && value.trim() === "") {
        /*
         *  When value is emtpy string
         */
        isValid = true;
        messages = [EMPTY_ERROR_MESSAGE];
        parsed = undefined;
      } else if (!Number.isFinite(parsed)) {
        /*
         *  When parsed value is not a finite numer
         */
        isValid = false;
        messages = [NUMBER_ERROR_MESSAGE];
        parsed = undefined;
      } else {
        /*
         *  When parsed value is a Number
         */
        isValid = true;
        messages = [EMPTY_ERROR_MESSAGE];
      }

      return {
        isValid,
        parsed,
        messages,
      };
    case "TEXT":
    case "PASSWORD":
    case "EMAIL":
      parsed = value;
      if (!_.isString(parsed)) {
        try {
          parsed = _.toString(parsed);
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
    default:
      return {
        isValid: false,
        parsed: "",
        messages: [STRING_ERROR_MESSAGE],
      };
  }
}

class InputWidget extends BaseInputWidget<InputWidgetProps, WidgetState> {
  constructor(props: InputWidgetProps) {
    super(props);
    this.state = {
      text: props.text,
    };
  }
  static getPropertyPaneConfig() {
    return _.merge(super.getPropertyPaneConfig(), [
      {
        sectionName: "General",
        children: [
          {
            helpText: "Changes the type of data captured in the input",
            propertyName: "inputType",
            label: "Data Type",
            controlType: "DROP_DOWN",
            options: [
              {
                label: "Text",
                value: "TEXT",
              },
              {
                label: "Number",
                value: "NUMBER",
              },
              {
                label: "Password",
                value: "PASSWORD",
              },
              {
                label: "Email",
                value: "EMAIL",
              },
            ],
            isBindProperty: false,
            isTriggerProperty: false,
          },
          {
            helpText: "Sets maximum allowed text length",
            propertyName: "maxChars",
            label: "Max Chars",
            controlType: "INPUT_TEXT",
            placeholderText: "255",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.NUMBER },
            hidden: (props: InputWidgetProps) => {
              return props.inputType !== InputTypes.TEXT;
            },
            dependencies: ["inputType"],
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
                  type: "string or number",
                  example: `John | 123`,
                  autocompleteDataType: AutocompleteDataType.STRING,
                },
              },
            },
            dependencies: ["inputType"],
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
    return super.getMetaPropertiesMap();
  }

  onValueChange = (value: string) => {
    let parsedValue;
    switch (this.props.inputType) {
      case "NUMBER":
      case "INTEGER":
        try {
          parsedValue = Number(value);
          break;
        } catch (e) {
          parsedValue = value;
        }
        break;
      case "TEXT":
      case "EMAIL":
      case "PASSWORD":
        parsedValue = value;
        break;
    }
    this.props.updateWidgetMetaProperty("text", parsedValue, {
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
    let isInvalid =
      "isValid" in this.props && !this.props.isValid && !!this.props.isDirty;
    const conditionalProps: Partial<InputComponentProps> = {};
    conditionalProps.errorMessage = this.props.errorMessage;
    if (this.props.isRequired && value.length === 0) {
      conditionalProps.errorMessage = createMessage(FIELD_REQUIRED_ERROR);
    }
    if (this.props.inputType === "TEXT" && this.props.maxChars) {
      // pass maxChars only for Text type inputs, undefined for other types
      conditionalProps.maxChars = this.props.maxChars;
      if (
        this.props.defaultText &&
        this.props.defaultText.toString().length > this.props.maxChars
      ) {
        isInvalid = true;
        conditionalProps.errorMessage = createMessage(
          INPUT_DEFAULT_TEXT_MAX_CHAR_ERROR,
        );
      }
    }
    if (this.props.maxNum) conditionalProps.maxNum = this.props.maxNum;
    if (this.props.minNum) conditionalProps.minNum = this.props.minNum;
    const minInputSingleLineHeight =
      this.props.label || this.props.tooltip
        ? // adjust height for label | tooltip extra div
          GRID_DENSITY_MIGRATION_V1 + 4
        : // GRID_DENSITY_MIGRATION_V1 used to adjust code as per new scaled canvas.
          GRID_DENSITY_MIGRATION_V1;

    return (
      <InputComponent
        autoFocus={this.props.autoFocus}
        // show label and Input side by side if true
        compactMode={
          !(
            (this.props.bottomRow - this.props.topRow) /
              GRID_DENSITY_MIGRATION_V1 >
              1 && this.props.inputType === "TEXT"
          )
        }
        defaultValue={this.props.defaultText}
        disableNewLineOnPressEnterKey={!!this.props.onSubmit}
        disabled={this.props.isDisabled}
        iconAlign={this.props.iconAlign}
        iconName={this.props.iconName}
        inputType={this.props.inputType}
        isInvalid={isInvalid}
        isLoading={this.props.isLoading}
        label={this.props.label}
        labelStyle={this.props.labelStyle}
        labelTextColor={this.props.labelTextColor}
        labelTextSize={this.props.labelTextSize}
        multiline={
          (this.props.bottomRow - this.props.topRow) /
            minInputSingleLineHeight >
            1 && this.props.inputType === "TEXT"
        }
        onFocusChange={this.handleFocusChange}
        onKeyDown={this.handleKeyDown}
        onValueChange={this.onValueChange}
        placeholder={this.props.placeholderText}
        showError={!!this.props.isFocused}
        stepSize={1}
        tooltip={this.props.tooltip}
        value={value}
        widgetId={this.props.widgetId}
        {...conditionalProps}
      />
    );
  }

  static getWidgetType(): WidgetType {
    return "INPUT_WIDGET_v2";
  }
}

export interface InputValidator {
  validationRegex: string;
  errorMessage: string;
}
export interface InputWidgetProps extends WidgetProps {
  inputType: InputType;
  defaultText?: string | number;
  tooltip?: string;
  isDisabled?: boolean;
  validation: boolean;
  text: string;
  regex?: string;
  errorMessage?: string;
  placeholderText?: string;
  maxChars?: number;
  minNum?: number;
  maxNum?: number;
  onTextChanged?: string;
  label: string;
  labelTextColor?: string;
  labelTextSize?: TextSize;
  labelStyle?: string;
  inputValidators: InputValidator[];
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

export default InputWidget;
