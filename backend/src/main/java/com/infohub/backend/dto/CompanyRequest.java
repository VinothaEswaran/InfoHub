package com.infohub.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class CompanyRequest {

    @NotBlank
    private String name;
    private String website;
    private String privacyPolicyUrl;
    private String dataCategories;

    public CompanyRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getPrivacyPolicyUrl() { return privacyPolicyUrl; }
    public void setPrivacyPolicyUrl(String privacyPolicyUrl) { this.privacyPolicyUrl = privacyPolicyUrl; }

    public String getDataCategories() { return dataCategories; }
    public void setDataCategories(String dataCategories) { this.dataCategories = dataCategories; }
}
