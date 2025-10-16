import { useState, useEffect } from 'react';

export interface GovernanceData {
  global_analytics: {
    total_schemas: number;
    total_tables: number;
    total_columns: number;
    schemas_with_description_pct: number;
    tables_with_description_pct: number;
    columns_with_description_pct: number;
    undocumented_columns_pct: number;
    business_entity_primary_coverage_pct: number;
    business_entity_secondary_coverage_pct: number;
    business_entity_l2_coverage_pct: number;
    data_type_distribution: {
      [dataType: string]: number;
    };
    naming_issues: {
      columns_with_spaces: number;
      columns_with_uppercase: number;
      columns_starting_with_number: number;
      columns_with_special_chars: number;
      columns_name_too_long_64: number;
    };
    top_schemas_lowest_doc: Array<{
      schema: string;
      tables: number;
      columns: number;
      doc_pct: number;
      url: string;
    }>;
    top_tables_lowest_doc: Array<{
      schema: string;
      table: string;
      columns: number;
      doc_pct: number;
      url: string;
    }>;
  };
  entity_global_analytics: {
    total_l1: number;
    total_l2: number;
    total_l1_excluding_unassigned: number;
    total_l2_excluding_unassigned: number;
    total_columns: number;
    columns_tagged_l1_count: number;
    columns_tagged_l1_pct: number;
    columns_tagged_l2_count: number;
    columns_tagged_l2_pct: number;
    columns_missing_l1_count: number;
    columns_missing_l1_pct: number;
    columns_missing_l2_count: number;
    columns_missing_l2_pct: number;
    data_type_distribution: {
      [dataType: string]: number;
    };
  };
  l1_entity_analytics?: {
    [entityName: string]: {
      l2_count: number;
      l2_count_excluding_unassigned: number;
      schema_count: number;
      table_count: number;
      column_count: number;
      columns_tagged_l1_count: number;
      columns_tagged_l2_count: number;
      columns_missing_l2_count: number;
      columns_missing_l2_pct: number;
      columns_with_description_pct: number;
      undocumented_columns_pct: number;
      children?: {
        [l2EntityName: string]: {
          schema_count: number;
          table_count: number;
          column_count: number;
          columns_tagged_l2_count: number;
          columns_with_description_pct: number;
          undocumented_columns_pct: number;
          columns_tagged_l1_count?: number;
        };
      };
    };
  };
  top_problem_columns: Array<{
    schema: string;
    table: string;
    column: string;
    datatype: string;
    issues: string[];
  }>;
  table_metrics: Array<{
    schema: string;
    table: string;
    column_count: number;
    documented_columns: number;
    documentation_pct: number;
  }>;
  entity_heirarcy: {
    [l1EntityName: string]: {
      analytics: {
        l2_count: number;
        l2_count_excluding_unassigned: number;
        schema_count: number;
        table_count: number;
        column_count: number;
        columns_tagged_l1_count: number;
        columns_tagged_l2_count: number;
        columns_missing_l2_count: number;
        columns_missing_l2_pct: number;
        columns_with_description_pct: number;
        undocumented_columns_pct: number;
        data_type_distribution: {
          [dataType: string]: number;
        };
      };
    };
  };
  schemas: Array<{
    schema: string;
    tables: number;
    columns: number;
    documented_pct: number;
    l1_coverage_pct: number;
    l2_coverage_pct: number;
    governance_score: number;
    issues: string[];
  }>;
}

export const useGovernanceData = () => {
  const [data, setData] = useState<GovernanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data.json');
        if (!response.ok) {
          throw new Error('Failed to fetch governance data');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};