import { createDataProvider, CreateDataProviderOptions } from "@refinedev/rest";

import { CreateResponse, GetOneResponse, ListResponse } from "@/types";
import { BACKEND_BASE_URL } from "@/constants";

const getDisplayText = (
  value: unknown,
  keys: string[] = ["name", "code", "description", "id"]
) => {
  if (value == null) return "";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    for (const key of keys) {
      const fieldValue = record[key];

      if (
        typeof fieldValue === "string" ||
        typeof fieldValue === "number" ||
        typeof fieldValue === "boolean"
      ) {
        return String(fieldValue);
      }
    }
  }

  return "";
};

const normalizeSubject = (subject: unknown) => {
  const record = subject as Record<string, unknown>;

  return {
    ...record,
    code: getDisplayText(record.code, ["code", "name", "id"]),
    name: getDisplayText(record.name, ["name", "code", "id"]),
    description: getDisplayText(record.description, [
      "description",
      "name",
      "code",
      "id",
    ]),
    department:
      getDisplayText(record.department, ["name", "code", "description", "id"]) ||
      getDisplayText(record.departmentName) ||
      getDisplayText(record.department_name) ||
      getDisplayText(record.departmentId) ||
      getDisplayText(record.department_id),
  };
};

const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: ({ resource }) => resource,

    buildQueryParams: async ({ resource, pagination, filters }) => {
      const params: Record<string, string | number> = {};

      if (pagination?.mode !== "off") {
        const page = pagination?.currentPage ?? 1;
        const pageSize = pagination?.pageSize ?? 10;

        params.page = page;
        params.limit = pageSize;
      }

      filters?.forEach((filter) => {
        const field = "field" in filter ? filter.field : "";
        const value = String(filter.value);

        if (field === "role") {
          params.role = value;
        }

        if (resource === "departments") {
          if (field === "name" || field === "code") params.search = value;
        }

        if (resource === "users") {
          if (field === "search" || field === "name" || field === "email") {
            params.search = value;
          }
        }

        if (resource === "subjects") {
          if (field === "department") params.department = value;
          if (field === "name" || field === "code") params.search = value;
        }

        if (resource === "classes") {
          if (field === "name") params.search = value;
          if (field === "subject") params.subject = value;
          if (field === "teacher") params.teacher = value;
        }
      });

      return params;
    },

    mapResponse: async (response, { resource }) => {
      const payload: ListResponse = await response.json();
      const data = payload.data ?? [];

      if (resource === "subjects") {
        return data.map(normalizeSubject);
      }

      return data;
    },

    getTotalCount: async (response) => {
      const payload: ListResponse = await response.json();
      return payload.pagination?.total ?? payload.data?.length ?? 0;
    },
  },

  create: {
    getEndpoint: ({ resource }) => resource,

    buildBodyParams: async ({ variables }) => variables,

    mapResponse: async (response) => {
      const json: CreateResponse = await response.json();
      return json.data ?? {};
    },
  },

  getOne: {
    getEndpoint: ({ resource, id }) => `${resource}/${id}`,

    mapResponse: async (response) => {
      const json: GetOneResponse = await response.json();
      return json.data ?? {};
    },
  },
};

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);

export { dataProvider };
