import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiResponseWrapper = <TModel extends Type<any>>(
  model: TModel,
  status = 200,
  description?: string,
) => {
  return applyDecorators(
    ApiResponse({
      status,
      description: description || `Success response`,
      schema: {
        allOf: [
          {
            properties: {
              data: {
                $ref: getSchemaPath(model),
              },
              message: {
                type: 'string',
                example: 'Success',
              },
              timestamp: {
                type: 'string',
                example: new Date().toISOString(),
              },
            },
          },
        ],
      },
    }),
  );
};
