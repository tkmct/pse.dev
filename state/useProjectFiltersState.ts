import { projects } from "@/data/projects"
import Fuse from "fuse.js"
import { create } from "zustand"

import { ProjectInterface } from "@/lib/types"
import { uniq } from "@/lib/utils"

export type ProjectFilter = "keywords" | "builtWith" | "themes"
export type FiltersProps = Record<ProjectFilter, string[]>

export const FilterLabelMapping: Record<ProjectFilter, string> = {
  keywords: "Keywords",
  builtWith: "Built with",
  themes: "Themes selected",
}

export const FilterTypeMapping: Record<ProjectFilter, "checkbox" | "button"> = {
  keywords: "checkbox",
  builtWith: "checkbox",
  themes: "button",
}
interface ProjectStateProps {
  projects: ProjectInterface[]
  filters: FiltersProps
  activeFilters: Partial<FiltersProps>
  queryString: string
}

interface SearchMatchByParamsProps {
  searchPattern: string
  activeFilters?: Partial<FiltersProps>
}

interface toggleFilterProps {
  tag: ProjectFilter
  value: string
  searchQuery?: string
}
interface ProjectActionsProps {
  toggleFilter: ({ tag, value, searchQuery }: toggleFilterProps) => void
  setFilterFromQueryString: (filters: Partial<FiltersProps>) => void
  onFilterProject: (searchPattern: string) => void
  onSelectTheme: (theme: string, searchPattern?: string) => void
}

const createURLQueryString = (params: Partial<FiltersProps>): string => {
  if (Object.keys(params)?.length === 0) return "" // no params, return empty string
  const qs = Object.keys(params)
    .map((key: any) => `${key}=${encodeURIComponent((params as any)[key])}`)
    .join("&")

  return qs
}

const getProjectFilters = (): FiltersProps => {
  const filters: FiltersProps = {
    themes: ["play", "build", "research"],
    keywords: [],
    builtWith: [],
  }

  // get list of all tags from project list
  projects.forEach((project) => {
    if (project?.tags?.builtWith) {
      filters.builtWith.push(...project?.tags?.builtWith)
    }

    if (project?.tags?.keywords) {
      filters.keywords.push(...project?.tags?.keywords)
    }
  })

  // duplicate-free array for every tags
  Object.entries(filters).forEach(([key, entries]) => {
    filters[key as ProjectFilter] = uniq(entries)
  })

  return filters
}

const filterProjects = ({
  searchPattern = "",
  activeFilters = {},
}: SearchMatchByParamsProps) => {
  // keys that will be used for search
  const keys = [
    "name",
    "tldr",
    "tags.themes",
    "tags.keywords",
    "tags.builtWith",
    "projectStatus",
  ]

  let tagsFiltersQuery: Record<string, string>[] = []

  Object.entries(activeFilters).forEach(([key, values]) => {
    values.forEach((value) => {
      if (!value) return // skip empty values
      tagsFiltersQuery.push({
        [`tags.${key}`]: value,
      })
    })
  })

  const noActiveFilters =
    tagsFiltersQuery.length === 0 && searchPattern.length === 0

  if (noActiveFilters) return projects

  let query: any = {}

  if (searchPattern?.length === 0) {
    query = {
      $and: [...tagsFiltersQuery],
    }
  } else if (tagsFiltersQuery.length === 0) {
    query = {
      name: searchPattern,
    }
  } else {
    query = {
      $and: [
        {
          $and: [...tagsFiltersQuery],
        },
        { name: searchPattern },
      ],
    }
  }

  const fuse = new Fuse(projects, {
    threshold: 0.2,
    useExtendedSearch: true,
    keys,
  })

  const result = fuse.search(query)?.map(({ item }) => item)

  return result ?? []
}

export const useProjectFiltersState = create<
  ProjectStateProps & ProjectActionsProps
>()((set) => ({
  projects,
  queryString: "",
  filters: getProjectFilters(), // list of filters with all possible values from projects
  activeFilters: {}, // list of filters active in the current view by the user
  toggleFilter: ({ tag: filterKey, value, searchQuery }: toggleFilterProps) =>
    set((state: any) => {
      if (!filterKey) return
      const values: string[] = state?.activeFilters?.[filterKey] ?? []
      const index = values?.indexOf(value)
      if (index > -1) {
        values.splice(index, 1)
      } else {
        values.push(value)
      }

      const activeFiltersNormalized = values.filter(Boolean)

      const activeFilters: Partial<FiltersProps> = {
        ...state.activeFilters,
        [filterKey]: activeFiltersNormalized,
      }
      const queryString = createURLQueryString(activeFilters)
      const filteredProjects = filterProjects({
        searchPattern: searchQuery ?? "",
        activeFilters,
      })

      return {
        ...state,
        activeFilters,
        queryString,
        projects: filteredProjects,
      }
    }),
  onSelectTheme: (theme: string, searchQuery = "") => {
    set((state: any) => {
      const activeFilters = {
        ...state.activeFilters,
        themes: [theme],
      }

      const filteredProjects = filterProjects({
        searchPattern: searchQuery ?? "",
        activeFilters,
      })

      return {
        ...state,
        activeFilters,
        projects: filteredProjects,
      }
    })
  },
  onFilterProject: (searchPattern: string) => {
    set((state: any) => {
      const filteredProjects = filterProjects({
        searchPattern,
        activeFilters: state.activeFilters,
      })

      return {
        ...state,
        projects: filteredProjects,
      }
    })
  },
  setFilterFromQueryString: (filters: Partial<FiltersProps>) => {
    set((state: any) => {
      return {
        ...state,
        activeFilters: filters,
        queryString: createURLQueryString(filters),
      }
    })
  },
}))