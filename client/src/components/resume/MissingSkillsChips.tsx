interface MissingSkillsChipsProps {
  skills: string[]; 
  // the missingSkills array from the Resume object — empty if no JD was provided
}

export function MissingSkillsChips({ skills }: MissingSkillsChipsProps) {
  // If there's nothing to show, render nothing rather than an awkward 
  // empty section with just a heading and no content underneath it.
  if (skills.length === 0) return null;

  return (
    <div>
      <h3 className="font-serif text-lg text-[#2D3B2A] mb-3">
        Missing Skills
      </h3>
      <p className="text-sm text-[#6B7263] mb-3">
        Found in the job description, but not in your resume
      </p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          // Using the skill text itself as the key is safe here because
          // getMissingSkills() on the backend already dedupes via a Set —
          // there will never be two identical strings in this array.
          <span
            key={skill}
            className="px-3 py-1 rounded-full text-sm bg-[#F5E6DD] text-[#C97B5A] border border-[#E8C4AE]"
            // warm clay tone, same family as ScoreGauge's "needs attention" 
            // color — visually ties "missing skill" to "thing to improve"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}