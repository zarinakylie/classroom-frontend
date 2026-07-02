import { createDataProvider, CreateDataProviderOptions } from "@refinedev/rest";

import { CreateResponse, GetOneResponse, ListResponse, Subject } from "@/types";
import { BACKEND_BASE_URL } from "@/constants";

type SubjectDepartment =
  | string
  | {
      name?: string | null;
    }
  | null
  | undefined;

type SubjectRecord = Omit<Subject, "department"> & {
  department?: SubjectDepartment;
  departmentName?: string | null;
  department_name?: string | null;
  departmentId?: string | number | null;
  department_id?: string | number | null;
};

const getDepartmentName = (subject: SubjectRecord) => {
  if (typeof subject.department === "string") {
    return subject.department;
  }

  if (subject.department && typeof subject.department === "object") {
    return subject.department.name ?? "";
  }

  return (
    subject.departmentName ??
    subject.department_name ??
    subject.departmentId?.toString() ??
    subject.department_id?.toString() ??
    ""
  );
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

      if (resource !== "subjects") {
        return data;
      }

      return data.map((subject) => {
        const subjectRecord = subject as SubjectRecord;

        return {
          ...subjectRecord,
          department: getDepartmentName(subjectRecord),
        };
      });
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
