import {
    ProjectCategory,
    ProjectContent,
    ProjectInterface,
    ProjectStatus,
  } from "@/lib/types"

const content: ProjectContent = {
    en: {
        tldr: "Publicly verifiable garbled circuit research",
        description: `
We are actively researching on publicly verifiable garbled circuit. This will lead to constant round publicly verifiable 2 party computation. Currently we're exploring two ways to achieve this. The first approach is based on authenticated garbling and vector OLE and the second approach is based on commited OT and zkp.
See more details [here](https://hackmd.io/@namncc/B1md-dp4ke).`,
    }
}

export const publiclyVerifiableGarbledCircuit: ProjectInterface = {
    id: "publicly-verifiable-garbled-circuit",
    category: ProjectCategory.RESEARCH,
    projectStatus: ProjectStatus.ACTIVE,
    section: "pse",
    content,
    image: "",
    imageAlt: "Publicly verifiable garbled circuit",
    name: "Publicly verifiable garbled circuit",
    links: {
        website: "https://hackmd.io/@namncc/B1md-dp4ke",
      },
    tags: {
        keywords: ["mpc", "garbled circuit", "zkp"],
        themes: ["research"],
    },
}