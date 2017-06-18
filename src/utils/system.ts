export module Types.System
{
    export class ProcessSummary
    {
        constructor(
            public ErrorMessages: string[] = [],
            public WarningMessages: string[] = [],
            public InfoMessages: string[] = []
        )
        {
        }

        /**
         * Adds the passed messages to the messages of the current object.
         * Returns the current object for method chaining.
         */
        public merge(ps: ProcessSummary): ProcessSummary
        {
            this.ErrorMessages = this.ErrorMessages.concat(ps.ErrorMessages);
            this.WarningMessages = this.WarningMessages.concat(ps.WarningMessages);
            this.InfoMessages = this.InfoMessages.concat(ps.InfoMessages);
            return this;
        }

        /** Creates and returns a new object that contains the messages of this object and the passed object. */
        public union(ps: ProcessSummary): ProcessSummary
        {
            return new ProcessSummary(
                this.ErrorMessages.concat(ps.ErrorMessages),
                this.WarningMessages.concat(ps.WarningMessages),
                this.InfoMessages.concat(ps.InfoMessages)
            );
        }

        public blockifyMessages(type: "info" | "warn" | "err"): string
        {
            var messages: string[] = undefined;
            switch (type) {
                case "info":
                    messages = this.InfoMessages;
                    break;
                case "warn":
                    messages = this.WarningMessages;
                    break;
                case "err":
                    messages = this.ErrorMessages;
                    break;
                default:
                    messages = [];
                    break;
            }

            return messages.join("\n");
        }
    }

    export type ProcessResult<dataType> = {
        Messages: ProcessSummary;
        Data: dataType;
    }
}